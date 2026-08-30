package com.guseoh.csforge.wrongnote.infrastructure;

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
import com.guseoh.csforge.wrongnote.application.WrongNoteListCriteria;
import com.guseoh.csforge.wrongnote.application.WrongNoteReviewFilter;
import com.guseoh.csforge.wrongnote.application.WrongNoteSort;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 오답 노트 목록을 필터·정렬·페이지 단위로 조회하는 JPA adapter이다.
 */
@Repository
@RequiredArgsConstructor
public class WrongNoteSearchRepository {

    private final EntityManager entityManager;

    public Page<WrongNote> search(WrongNoteListCriteria criteria, Pageable pageable) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<WrongNote> query = builder.createQuery(WrongNote.class);
        Root<WrongNote> root = query.from(WrongNote.class);
        root.fetch("question", JoinType.INNER);
        Join<WrongNote, Question> question = root.join("question", JoinType.INNER);
        query.select(root).distinct(true)
                .where(predicates(builder, query, root, criteria))
                .orderBy(order(builder, query, root, question, criteria.sort()));
        TypedQuery<WrongNote> typedQuery = entityManager.createQuery(query)
                .setFirstResult(Math.toIntExact(pageable.getOffset()))
                .setMaxResults(pageable.getPageSize());
        long total = count(criteria);
        return new PageImpl<>(typedQuery.getResultList(), pageable, total);
    }

    private long count(WrongNoteListCriteria criteria) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = builder.createQuery(Long.class);
        Root<WrongNote> root = query.from(WrongNote.class);
        query.select(builder.countDistinct(root.get("id")))
                .where(predicates(builder, query, root, criteria));
        return entityManager.createQuery(query).getSingleResult();
    }

    private Predicate[] predicates(
            CriteriaBuilder builder,
            CriteriaQuery<?> query,
            Root<WrongNote> root,
            WrongNoteListCriteria criteria) {
        Join<WrongNote, Question> question = root.join("question", JoinType.INNER);
        Join<?, ?> link = question.join("conceptLinks", JoinType.INNER);
        Join<?, ?> concept = link.join("concept", JoinType.INNER);
        Join<?, ?> topic = concept.join("topic", JoinType.INNER);
        Join<?, ?> area = topic.join("learningArea", JoinType.INNER);
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.equal(concept.get("status"), ContentStatus.PUBLISHED));
        if (criteria.areaSlug() != null) predicates.add(builder.equal(area.get("slug"), criteria.areaSlug()));
        if (criteria.topicId() != null) predicates.add(builder.equal(topic.get("id"), criteria.topicId()));
        if (criteria.level() != null) predicates.add(builder.equal(concept.get("level"), criteria.level()));
        if (criteria.difficulty() != null) predicates.add(builder.equal(question.get("difficulty"), criteria.difficulty()));
        if (criteria.status() != null) predicates.add(builder.equal(root.get("status"), criteria.status()));
        addReviewPredicate(builder, query, question, criteria, predicates);
        return predicates.toArray(Predicate[]::new);
    }

    private void addReviewPredicate(
            CriteriaBuilder builder,
            CriteriaQuery<?> query,
            Join<?, Question> question,
            WrongNoteListCriteria criteria,
            List<Predicate> predicates) {
        if (criteria.reviewFilter() == WrongNoteReviewFilter.ALL) return;
        Subquery<Long> schedules = query.subquery(Long.class);
        Root<ReviewSchedule> schedule = schedules.from(ReviewSchedule.class);
        List<Predicate> conditions = new ArrayList<>();
        conditions.add(builder.equal(schedule.get("questionId"), question.get("id")));
        schedules.select(builder.literal(1L));
        switch (criteria.reviewFilter()) {
            case SCHEDULED -> conditions.add(builder.equal(schedule.get("status"), ReviewScheduleStatus.SCHEDULED));
            case MASTERED -> conditions.add(builder.equal(schedule.get("status"), ReviewScheduleStatus.MASTERED));
            case DUE -> {
                conditions.add(builder.equal(schedule.get("status"), ReviewScheduleStatus.SCHEDULED));
                conditions.add(builder.lessThanOrEqualTo(schedule.get("dueAt"), criteria.now()));
            }
            case NONE -> predicates.add(builder.not(builder.exists(schedules))); 
            case ALL -> { }
        }
        if (criteria.reviewFilter() != WrongNoteReviewFilter.NONE) {
            schedules.where(conditions.toArray(Predicate[]::new));
            predicates.add(builder.exists(schedules));
        }
    }

    private jakarta.persistence.criteria.Order[] order(
            CriteriaBuilder builder,
            CriteriaQuery<?> query,
            Root<WrongNote> root,
            Join<WrongNote, Question> question,
            WrongNoteSort sort) {
        return switch (sort) {
            case WRONG_COUNT -> new jakarta.persistence.criteria.Order[] {builder.desc(root.get("wrongCount")), builder.desc(root.get("id"))};
            case REVIEW_DUE -> {
                Subquery<java.time.Instant> dueAt = query.subquery(java.time.Instant.class);
                Root<ReviewSchedule> schedule = dueAt.from(ReviewSchedule.class);
                dueAt.select(schedule.get("dueAt"))
                        .where(builder.equal(schedule.get("questionId"), question.get("id")));
                yield new jakarta.persistence.criteria.Order[] {builder.asc(dueAt), builder.desc(root.get("id"))};
            }
            case RECENT -> new jakarta.persistence.criteria.Order[] {builder.desc(root.get("lastWrongAt")), builder.desc(root.get("id"))};
        };
    }
}
