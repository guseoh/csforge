package com.guseoh.csforge.review.infrastructure;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionStatus;
import com.guseoh.csforge.review.application.ReviewListCriteria;
import com.guseoh.csforge.review.domain.ReviewSchedule;

/**
 * 복습 일정의 필터·페이지 조회를 수행하는 JPA adapter이다.
 */
@Repository
@RequiredArgsConstructor
public class ReviewScheduleSearchRepository {

    private final EntityManager entityManager;

    public Page<ReviewSchedule> search(ReviewListCriteria criteria, Pageable pageable) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<ReviewSchedule> query = builder.createQuery(ReviewSchedule.class);
        Root<ReviewSchedule> root = query.from(ReviewSchedule.class);
        root.fetch("question", JoinType.INNER);
        query.select(root).distinct(true)
                .where(predicates(builder, root, criteria))
                .orderBy(builder.asc(root.get("dueAt")), builder.asc(root.get("questionId")));
        TypedQuery<ReviewSchedule> typed = entityManager.createQuery(query)
                .setFirstResult(Math.toIntExact(pageable.getOffset()))
                .setMaxResults(pageable.getPageSize());
        return new PageImpl<>(typed.getResultList(), pageable, count(criteria));
    }

    private long count(ReviewListCriteria criteria) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<ReviewSchedule> root = query.from(ReviewSchedule.class);
        query.select(builder.countDistinct(root.get("questionId")))
                .where(predicates(builder, root, criteria));
        return entityManager.createQuery(query).getSingleResult();
    }

    private Predicate[] predicates(CriteriaBuilder builder, Root<ReviewSchedule> root, ReviewListCriteria criteria) {
        Join<ReviewSchedule, Question> question = root.join("question", JoinType.INNER);
        Join<?, ?> link = question.join("conceptLinks", JoinType.INNER);
        Join<?, ?> concept = link.join("concept", JoinType.INNER);
        Join<?, ?> topic = concept.join("topic", JoinType.INNER);
        Join<?, ?> area = topic.join("learningArea", JoinType.INNER);
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.equal(question.get("status"), QuestionStatus.PUBLISHED));
        predicates.add(builder.equal(concept.get("status"), ContentStatus.PUBLISHED));
        predicates.add(builder.isTrue(topic.get("active")));
        predicates.add(builder.isTrue(area.get("active")));
        if (criteria.status() != null) predicates.add(builder.equal(root.get("status"), criteria.status()));
        if (criteria.areaSlug() != null) predicates.add(builder.equal(area.get("slug"), criteria.areaSlug()));
        if (criteria.topicId() != null) predicates.add(builder.equal(topic.get("id"), criteria.topicId()));
        if (criteria.level() != null) predicates.add(builder.equal(concept.get("level"), criteria.level()));
        switch (criteria.dueWindow()) {
            case OVERDUE -> predicates.add(builder.lessThan(root.get("dueAt"), criteria.startOfToday()));
            case DUE -> predicates.add(builder.lessThanOrEqualTo(root.get("dueAt"), criteria.now()));
            case NEXT_24H -> predicates.add(builder.and(
                    builder.greaterThan(root.get("dueAt"), criteria.now()),
                    builder.lessThanOrEqualTo(root.get("dueAt"), criteria.now().plusSeconds(86_400))));
            case NEXT_7D -> predicates.add(builder.and(
                    builder.greaterThan(root.get("dueAt"), criteria.now().plusSeconds(86_400)),
                    builder.lessThanOrEqualTo(root.get("dueAt"), criteria.now().plusSeconds(604_800))));
            case ALL -> { }
        }
        return predicates.toArray(Predicate[]::new);
    }

    public List<Long> findEligibleQuestionIds(
            com.guseoh.csforge.review.application.ReviewQuizSetupCommand command,
            Instant cutoff) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<ReviewSchedule> root = query.from(ReviewSchedule.class);
        Join<ReviewSchedule, Question> question = root.join("question", JoinType.INNER);

        Subquery<Long> visible = query.subquery(Long.class);
        Root<com.guseoh.csforge.question.domain.QuestionConcept> link =
                visible.from(com.guseoh.csforge.question.domain.QuestionConcept.class);
        Join<?, ?> concept = link.join("concept", JoinType.INNER);
        Join<?, ?> topic = concept.join("topic", JoinType.INNER);
        Join<?, ?> area = topic.join("learningArea", JoinType.INNER);

        List<Predicate> subPredicates = new ArrayList<>();
        subPredicates.add(builder.equal(link.get("question").get("id"), question.get("id")));
        subPredicates.add(builder.equal(concept.get("status"), ContentStatus.PUBLISHED));
        subPredicates.add(builder.isTrue(topic.get("active")));
        subPredicates.add(builder.isTrue(area.get("active")));
        if (command.areaSlug() != null) {
            subPredicates.add(builder.equal(area.get("slug"), command.areaSlug()));
        }
        if (command.topicId() != null) {
            subPredicates.add(builder.equal(topic.get("id"), command.topicId()));
        }
        if (command.level() != null) {
            subPredicates.add(builder.equal(concept.get("level"), command.level()));
        }
        visible.select(builder.literal(1L)).where(subPredicates.toArray(Predicate[]::new));

        query.select(root.get("questionId"))
                .where(
                        builder.equal(root.get("status"), com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED),
                        builder.lessThanOrEqualTo(root.get("dueAt"), cutoff),
                        builder.equal(question.get("status"), com.guseoh.csforge.question.domain.QuestionStatus.PUBLISHED),
                        builder.exists(visible))
                .orderBy(builder.asc(root.get("dueAt")), builder.asc(root.get("questionId")));

        return entityManager.createQuery(query)
                .setMaxResults(command.count())
                .getResultList();
    }
}
