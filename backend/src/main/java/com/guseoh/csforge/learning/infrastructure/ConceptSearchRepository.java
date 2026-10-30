package com.guseoh.csforge.learning.infrastructure;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.StringJoiner;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.ConceptSearchItem;
import com.guseoh.csforge.learning.application.ConceptSearchResult;
import com.guseoh.csforge.learning.application.ConceptSort;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningStatus;

/** 사용자 학습 상태를 포함한 Concept 검색 조건과 정렬을 JPQL로 구성한다. */
@Repository
public class ConceptSearchRepository {

    private static final String FROM = """
            from Concept c
            join c.topic t
            join t.learningArea a
            left join ConceptProgress p on p.concept = c
            """;

    private final EntityManager entityManager;

    public ConceptSearchRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public ConceptSearchResult search(ConceptSearchCriteria criteria) {
        QueryParts parts = queryParts(criteria);
        String select = """
                select new com.guseoh.csforge.learning.application.ConceptSearchItem(
                    c.id, a.slug, a.name, t.id, t.slug, t.title, c.title, c.summary,
                    c.level, c.status, coalesce(p.status, :unseen),
                    coalesce(p.bookmarked, false), p.lastViewedAt)
                """;
        TypedQuery<ConceptSearchItem> dataQuery = entityManager.createQuery(
                select + FROM + parts.whereClause() + orderBy(criteria.sort()),
                ConceptSearchItem.class);
        bind(dataQuery, parts.parameters());
        dataQuery.setParameter("unseen", LearningStatus.UNSEEN);
        dataQuery.setFirstResult(Math.multiplyExact(criteria.page(), criteria.size()));
        dataQuery.setMaxResults(criteria.size());

        TypedQuery<Long> countQuery = entityManager.createQuery(
                "select count(c.id) " + FROM + parts.whereClause(), Long.class);
        bind(countQuery, parts.parameters());

        List<ConceptSearchItem> items = dataQuery.getResultList();
        return new ConceptSearchResult(items, countQuery.getSingleResult());
    }

    private QueryParts queryParts(ConceptSearchCriteria criteria) {
        StringJoiner where = new StringJoiner(" and ", " where ", "");
        Map<String, Object> parameters = new LinkedHashMap<>();
        where.add("c.status = :published");
        where.add("t.active = true");
        where.add("a.active = true");
        parameters.put("published", ContentStatus.PUBLISHED);

        addPredicate(where, parameters, criteria.areaSlug(), "a.slug = :areaSlug", "areaSlug");
        addPredicate(where, parameters, criteria.topicId(), "t.id = :topicId", "topicId");
        addPredicate(where, parameters, criteria.level(), "c.level = :level", "level");
        addPredicate(where, parameters, criteria.learningStatus(),
                "coalesce(p.status, :unseen) = :learningStatus", "learningStatus");
        if (criteria.learningStatus() != null) {
            parameters.put("unseen", LearningStatus.UNSEEN);
        }
        addPredicate(where, parameters, criteria.bookmarked(),
                "coalesce(p.bookmarked, false) = :bookmarked", "bookmarked");

        if (criteria.bookmarkCategoryId() != null) {
            where.add("coalesce(p.bookmarked, false) = true");
            where.add("exists (select assignment.conceptId from BookmarkCategoryAssignment assignment "
                    + "where assignment.conceptId = c.id and assignment.category.id = :bookmarkCategoryId)");
            parameters.put("bookmarkCategoryId", criteria.bookmarkCategoryId());
        }
        if (criteria.query() != null) {
            where.add("(lower(c.title) like :query or lower(coalesce(c.summary, '')) like :query)");
            parameters.put("query", "%" + criteria.query().toLowerCase(Locale.ROOT) + "%");
        }
        return new QueryParts(where.toString(), parameters);
    }

    private <T> void addPredicate(
            StringJoiner where,
            Map<String, Object> parameters,
            T value,
            String predicate,
            String parameter) {
        if (value != null) {
            where.add(predicate);
            parameters.put(parameter, value);
        }
    }

    private void bind(TypedQuery<?> query, Map<String, Object> parameters) {
        parameters.forEach((name, value) -> query.setParameter(name, value));
    }

    private String orderBy(ConceptSort sort) {
        return switch (sort) {
            case CURRICULUM -> " order by a.displayOrder, t.displayOrder, c.displayOrder, c.id";
            case TITLE -> " order by lower(c.title), c.id";
            case UPDATED -> " order by c.updatedAt desc, c.id";
            case VIEWED -> " order by case when p.lastViewedAt is null then 1 else 0 end, "
                    + "p.lastViewedAt desc, c.id";
        };
    }

    private record QueryParts(String whereClause, Map<String, Object> parameters) {
    }
}
