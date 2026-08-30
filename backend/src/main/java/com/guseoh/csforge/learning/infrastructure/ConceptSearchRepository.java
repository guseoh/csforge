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
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
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
        Join<Concept, ConceptProgress> progress = concept.join("progress", JoinType.LEFT);

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
                builder.coalesce(progress.<LearningStatus>get("status"), LearningStatus.UNSEEN),
                builder.coalesce(progress.<Boolean>get("bookmarked"), false),
                progress.get("lastViewedAt")));
        dataQuery.where(predicates(builder, concept, topic, area, progress, criteria));
        dataQuery.orderBy(orderBy(builder, concept, topic, area, progress, criteria));

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
        Join<Concept, ConceptProgress> progress = concept.join("progress", JoinType.LEFT);

        countQuery.select(builder.count(concept));
        countQuery.where(predicates(builder, concept, topic, area, progress, criteria));
        return entityManager.createQuery(countQuery).getSingleResult();
    }

    private Predicate[] predicates(
            CriteriaBuilder builder,
            Root<Concept> concept,
            Join<Concept, Topic> topic,
            Join<Topic, LearningArea> area,
            Join<Concept, ConceptProgress> progress,
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
            Expression<LearningStatus> status = builder.coalesce(
                    progress.<LearningStatus>get("status"),
                    LearningStatus.UNSEEN);
            predicates.add(builder.equal(status, criteria.learningStatus()));
        }
        if (criteria.bookmarked() != null) {
            Expression<Boolean> bookmarked = builder.coalesce(progress.<Boolean>get("bookmarked"), false);
            predicates.add(builder.equal(bookmarked, criteria.bookmarked()));
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
            CriteriaBuilder builder,
            Root<Concept> concept,
            Join<Concept, Topic> topic,
            Join<Topic, LearningArea> area,
            Join<Concept, ConceptProgress> progress,
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
            case VIEWED -> viewedOrder(builder, concept, progress);
        };
    }

    private List<Order> viewedOrder(
            CriteriaBuilder builder,
            Root<Concept> concept,
            Join<Concept, ConceptProgress> progress) {
        Expression<Integer> nullRank = builder.<Integer>selectCase()
                .when(builder.isNull(progress.get("lastViewedAt")), 1)
                .otherwise(0);
        return List.of(
                builder.asc(nullRank),
                builder.desc(progress.<Instant>get("lastViewedAt")),
                builder.asc(concept.get("id")));
    }
}
