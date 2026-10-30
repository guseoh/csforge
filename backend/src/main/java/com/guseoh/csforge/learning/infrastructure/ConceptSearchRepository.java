package com.guseoh.csforge.learning.infrastructure;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.stereotype.Repository;

import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.ConceptSearchItem;
import com.guseoh.csforge.learning.application.ConceptSearchResult;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptProgress;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.Topic;

/** 사용자 학습 상태를 포함한 Concept 검색 조건과 정렬을 JPA Criteria로 구성한다. */
@Repository
public class ConceptSearchRepository {

    private final EntityManager entityManager;

    public ConceptSearchRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public ConceptSearchResult search(ConceptSearchCriteria criteria) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<ConceptSearchItem> dataQuery = builder.createQuery(ConceptSearchItem.class);
        Root<Concept> concept = dataQuery.from(Concept.class);
        Join<Concept, Topic> topic = concept.join("topic");
        Join<Topic, LearningArea> area = topic.join("learningArea");

        dataQuery.select(builder.construct(
                ConceptSearchItem.class,
                concept.get("id"),
                area.get("slug"),
                area.get("name"),
                topic.get("id"),
                topic.get("slug"),
                topic.get("title"),
                concept.get("title"),
                concept.get("summary"),
                concept.get("level"),
                concept.get("status"),
                progressStatus(dataQuery, builder, concept),
                progressBookmarked(dataQuery, builder, concept),
                progressLastViewedAt(dataQuery, builder, concept)));
        dataQuery.where(predicates(dataQuery, builder, concept, topic, area, criteria));
        dataQuery.orderBy(orderBy(dataQuery, builder, concept, topic, area, criteria));

        TypedQuery<ConceptSearchItem> query = entityManager.createQuery(dataQuery);
        query.setFirstResult(Math.multiplyExact(criteria.page(), criteria.size()));
        query.setMaxResults(criteria.size());

        return new ConceptSearchResult(query.getResultList(), count(criteria));
    }

    private long count(ConceptSearchCriteria criteria) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> countQuery = builder.createQuery(Long.class);
        Root<Concept> concept = countQuery.from(Concept.class);
        Join<Concept, Topic> topic = concept.join("topic");
        Join<Topic, LearningArea> area = topic.join("learningArea");

        countQuery.select(builder.count(concept));
        countQuery.where(predicates(countQuery, builder, concept, topic, area, criteria));
        return entityManager.createQuery(countQuery).getSingleResult();
    }

    private Predicate[] predicates(
            CriteriaQuery<?> parentQuery,
            CriteriaBuilder builder,
            Root<Concept> concept,
            Join<Concept, Topic> topic,
            Join<Topic, LearningArea> area,
            ConceptSearchCriteria criteria) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(builder.equal(concept.get("status"), ContentStatus.PUBLISHED));
        predicates.add(builder.isTrue(topic.get("active")));
        predicates.add(builder.isTrue(area.get("active")));

        if (criteria.areaSlug() != null) {
            predicates.add(builder.equal(area.get("slug"), criteria.areaSlug()));
        }
        if (criteria.topicId() != null) {
            predicates.add(builder.equal(topic.get("id"), criteria.topicId()));
        }
        if (criteria.level() != null) {
            predicates.add(builder.equal(concept.get("level"), criteria.level()));
        }
        if (criteria.learningStatus() != null) {
            Expression<LearningStatus> status = progressStatus(parentQuery, builder, concept);
            predicates.add(builder.equal(status, criteria.learningStatus()));
        }
        if (criteria.bookmarked() != null) {
            Expression<Boolean> bookmarked = progressBookmarked(parentQuery, builder, concept);
            predicates.add(builder.equal(bookmarked, criteria.bookmarked()));
        }
        if (criteria.bookmarkCategoryId() != null) {

            Subquery<Long> match = parentQuery.subquery(Long.class);
            Root<com.guseoh.csforge.learning.domain.BookmarkCategoryAssignment> assignment =
                    match.from(com.guseoh.csforge.learning.domain.BookmarkCategoryAssignment.class);
            match.select(assignment.get("conceptId"));
            match.where(
                    builder.equal(assignment.get("conceptId"), concept.get("id")),
                    builder.equal(assignment.get("category").get("id"), criteria.bookmarkCategoryId()));
            predicates.add(builder.isTrue(progressBookmarked(parentQuery, builder, concept)));
            predicates.add(builder.exists(match));
        }
        if (criteria.query() != null) {
            String pattern = "%" + criteria.query().toLowerCase(Locale.ROOT) + "%";
            Expression<String> summary = builder.coalesce(concept.<String>get("summary"), "");
            predicates.add(builder.or(
                    builder.like(builder.lower(concept.get("title")), pattern),
                    builder.like(builder.lower(summary), pattern)));
        }
        return predicates.toArray(Predicate[]::new);
    }

    private List<Order> orderBy(
            CriteriaQuery<?> parentQuery,
            CriteriaBuilder builder,
            Root<Concept> concept,
            Join<Concept, Topic> topic,
            Join<Topic, LearningArea> area,
            ConceptSearchCriteria criteria) {
        return switch (criteria.sort()) {
            case CURRICULUM -> List.of(
                    builder.asc(area.get("displayOrder")),
                    builder.asc(topic.get("displayOrder")),
                    builder.asc(concept.get("displayOrder")),
                    builder.asc(concept.get("id")));
            case TITLE -> List.of(
                    builder.asc(builder.lower(concept.get("title"))),
                    builder.asc(concept.get("id")));
            case UPDATED -> List.of(
                    builder.desc(concept.<Instant>get("updatedAt")),
                    builder.asc(concept.get("id")));
            case VIEWED -> viewedOrder(parentQuery, builder, concept);
        };
    }

    private List<Order> viewedOrder(
            CriteriaQuery<?> parentQuery,
            CriteriaBuilder builder,
            Root<Concept> concept) {
        Expression<Instant> lastViewedAt = progressLastViewedAt(parentQuery, builder, concept);
        Expression<Integer> nullRank = builder.<Integer>selectCase()
                .when(builder.isNull(lastViewedAt), 1)
                .otherwise(0);
        return List.of(
                builder.asc(nullRank),
                builder.desc(lastViewedAt),
                builder.asc(concept.get("id")));
    }

    private Expression<LearningStatus> progressStatus(
            CriteriaQuery<?> parentQuery, CriteriaBuilder builder, Root<Concept> concept) {
        Subquery<LearningStatus> status = parentQuery.subquery(LearningStatus.class);
        Root<ConceptProgress> progress = status.from(ConceptProgress.class);
        status.select(progress.get("status"));
        status.where(builder.equal(progress.get("conceptId"), concept.get("id")));
        return builder.coalesce(status, LearningStatus.UNSEEN);
    }

    private Expression<Boolean> progressBookmarked(
            CriteriaQuery<?> parentQuery, CriteriaBuilder builder, Root<Concept> concept) {
        Subquery<Boolean> bookmarked = parentQuery.subquery(Boolean.class);
        Root<ConceptProgress> progress = bookmarked.from(ConceptProgress.class);
        bookmarked.select(progress.get("bookmarked"));
        bookmarked.where(builder.equal(progress.get("conceptId"), concept.get("id")));
        return builder.coalesce(bookmarked, false);
    }

    private Expression<Instant> progressLastViewedAt(
            CriteriaQuery<?> parentQuery, CriteriaBuilder builder, Root<Concept> concept) {
        Subquery<Instant> lastViewedAt = parentQuery.subquery(Instant.class);
        Root<ConceptProgress> progress = lastViewedAt.from(ConceptProgress.class);
        lastViewedAt.select(progress.get("lastViewedAt"));
        lastViewedAt.where(builder.equal(progress.get("conceptId"), concept.get("id")));
        return lastViewedAt;
    }
}
