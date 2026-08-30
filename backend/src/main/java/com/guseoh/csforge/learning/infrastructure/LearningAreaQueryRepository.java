package com.guseoh.csforge.learning.infrastructure;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;

import com.guseoh.csforge.learning.application.LearningAreaDetailView;
import com.guseoh.csforge.learning.application.LearningAreaSummaryView;
import com.guseoh.csforge.learning.application.TopicSummaryView;
import com.guseoh.csforge.learning.domain.LearningArea;

@Repository
public class LearningAreaQueryRepository {

    private static final String AREA_SUMMARY_QUERY = """
            select new com.guseoh.csforge.learning.application.LearningAreaSummaryView(
                la.id,
                la.slug,
                la.name,
                la.description,
                count(distinct t.id),
                count(c.id),
                count(case when cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end),
                count(case when cp.bookmarked = true then 1 end),
                count(case when c.level = 1 then 1 end),
                count(case when c.level = 1 and cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end),
                count(case when c.level = 2 then 1 end),
                count(case when c.level = 2 and cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end),
                count(case when c.level = 3 then 1 end),
                count(case when c.level = 3 and cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end)
            )
            from LearningArea la
            left join Topic t on t.learningArea = la and t.active = true
            left join Concept c on c.topic = t and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
            left join ConceptProgress cp on cp.concept = c
            where la.active = true
            group by la.id, la.slug, la.name, la.description, la.displayOrder
            order by la.displayOrder, la.id
            """;

    private static final String TOPIC_SUMMARY_QUERY = """
            select new com.guseoh.csforge.learning.application.TopicSummaryView(
                t.id,
                t.slug,
                t.title,
                t.description,
                count(c.id),
                count(case when cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end),
                count(case when cp.bookmarked = true then 1 end),
                count(case when c.level = 1 then 1 end),
                count(case when c.level = 2 then 1 end),
                count(case when c.level = 3 then 1 end),
                count(case when cp.conceptId is null or cp.status = com.guseoh.csforge.learning.domain.LearningStatus.UNSEEN then 1 end),
                count(case when cp.status = com.guseoh.csforge.learning.domain.LearningStatus.LEARNING then 1 end),
                count(case when cp.status = com.guseoh.csforge.learning.domain.LearningStatus.REVIEW_NEEDED then 1 end)
            )
            from Topic t
            join t.learningArea la
            left join Concept c on c.topic = t and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
            left join ConceptProgress cp on cp.concept = c
            where la.slug = :areaSlug
              and la.active = true
              and t.active = true
            group by t.id, t.slug, t.title, t.description, t.displayOrder
            order by t.displayOrder, t.id
            """;

    private final EntityManager entityManager;

    public LearningAreaQueryRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<LearningAreaSummaryView> findAreaSummaries() {
        return entityManager.createQuery(AREA_SUMMARY_QUERY, LearningAreaSummaryView.class)
                .getResultList();
    }

    public Optional<LearningAreaDetailView> findAreaDetail(String areaSlug) {
        Optional<LearningArea> area = entityManager.createQuery("""
                        select la
                        from LearningArea la
                        where la.slug = :areaSlug and la.active = true
                        """, LearningArea.class)
                .setParameter("areaSlug", areaSlug)
                .getResultStream()
                .findFirst();

        return area.map(found -> new LearningAreaDetailView(
                found.getId(),
                found.getSlug(),
                found.getName(),
                found.getDescription(),
                findTopicSummaries(areaSlug)));
    }

    private List<TopicSummaryView> findTopicSummaries(String areaSlug) {
        return entityManager.createQuery(TOPIC_SUMMARY_QUERY, TopicSummaryView.class)
                .setParameter("areaSlug", areaSlug)
                .getResultList();
    }
}
