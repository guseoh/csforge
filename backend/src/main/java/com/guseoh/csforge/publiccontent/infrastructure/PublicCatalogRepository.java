package com.guseoh.csforge.publiccontent.infrastructure;

import java.util.List;

import com.guseoh.csforge.learning.application.ConceptSearchCriteria;
import com.guseoh.csforge.learning.application.ConceptSort;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.publiccontent.application.PublicAreaSummaryView;
import com.guseoh.csforge.publiccontent.application.PublicConceptItemView;
import com.guseoh.csforge.publiccontent.application.PublicTopicView;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/** 개인 테이블에 접근하지 않고 공개 canonical 커리큘럼만 조회한다. */
@Repository
@RequiredArgsConstructor
public class PublicCatalogRepository {

    private static final String CONCEPT_FROM = """
            from Concept c join c.topic t join t.learningArea a
            where c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
              and t.active = true and a.active = true
            """;
    private final EntityManager entityManager;

    public List<PublicAreaSummaryView> areas() {
        return entityManager.createQuery("""
                select new com.guseoh.csforge.publiccontent.application.PublicAreaSummaryView(
                    a.id, a.slug, a.name, a.description, count(distinct t.id), count(c.id))
                from LearningArea a
                left join Topic t on t.learningArea = a and t.active = true
                left join Concept c on c.topic = t and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                where a.active = true
                group by a.id, a.slug, a.name, a.description, a.displayOrder
                order by a.displayOrder, a.id
                """, PublicAreaSummaryView.class).getResultList();
    }

    public java.util.Optional<LearningArea> area(String slug) {
        return entityManager.createQuery("select a from LearningArea a where a.slug = :slug and a.active = true", LearningArea.class)
                .setParameter("slug", slug).getResultStream().findFirst();
    }

    public List<PublicTopicView> topics(String slug) {
        return entityManager.createQuery("""
                select new com.guseoh.csforge.publiccontent.application.PublicTopicView(
                    t.id, t.slug, t.title, t.description, count(c.id),
                    count(case when c.level = 1 then 1 end),
                    count(case when c.level = 2 then 1 end),
                    count(case when c.level = 3 then 1 end))
                from Topic t join t.learningArea a
                left join Concept c on c.topic = t and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                where a.slug = :slug and a.active = true and t.active = true
                group by t.id, t.slug, t.title, t.description, t.displayOrder
                order by t.displayOrder, t.id
                """, PublicTopicView.class).setParameter("slug", slug).getResultList();
    }

    public long count(ConceptSearchCriteria criteria) {
        return bind(entityManager.createQuery("select count(c.id) " + filteredFrom(criteria), Long.class), criteria)
                .getSingleResult();
    }

    public List<PublicConceptItemView> concepts(ConceptSearchCriteria criteria) {
        String order = switch (criteria.sort()) {
            case TITLE -> "lower(c.title), c.id";
            case UPDATED -> "c.updatedAt desc, c.id";
            default -> "a.displayOrder, a.id, t.displayOrder, t.id, c.displayOrder, c.id";
        };
        return bind(entityManager.createQuery("""
                select new com.guseoh.csforge.publiccontent.application.PublicConceptItemView(
                    c.id, a.slug, a.name, t.id, t.slug, t.title, c.title, c.summary, c.level)
                """ + filteredFrom(criteria) + " order by " + order, PublicConceptItemView.class), criteria)
                .setFirstResult(Math.multiplyExact(criteria.page(), criteria.size()))
                .setMaxResults(criteria.size()).getResultList();
    }

    private String filteredFrom(ConceptSearchCriteria criteria) {
        return CONCEPT_FROM
                + (criteria.areaSlug() == null ? "" : " and a.slug = :area")
                + (criteria.topicId() == null ? "" : " and t.id = :topic")
                + (criteria.level() == null ? "" : " and c.level = :level")
                + (criteria.query() == null ? "" : " and (lower(c.title) like :query escape '\\' or lower(coalesce(c.summary, '')) like :query escape '\\')");
    }

    private <T> TypedQuery<T> bind(TypedQuery<T> query, ConceptSearchCriteria criteria) {
        if (criteria.areaSlug() != null) query.setParameter("area", criteria.areaSlug());
        if (criteria.topicId() != null) query.setParameter("topic", criteria.topicId());
        if (criteria.level() != null) query.setParameter("level", criteria.level());
        if (criteria.query() != null) {
            String escaped = criteria.query().toLowerCase(java.util.Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
            query.setParameter("query", "%" + escaped + "%");
        }
        return query;
    }
}
