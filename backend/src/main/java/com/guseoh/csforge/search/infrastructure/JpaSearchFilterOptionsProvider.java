package com.guseoh.csforge.search.infrastructure;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.search.application.SearchAreaFilterView;
import com.guseoh.csforge.search.application.SearchFilterOptionsProvider;
import com.guseoh.csforge.search.application.SearchTopicFilterView;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** active LearningArea/Topic Search filter를 PostgreSQL에서 stable curriculum order로 조회한다. */
@Repository
public class JpaSearchFilterOptionsProvider implements SearchFilterOptionsProvider {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public List<SearchAreaFilterView> load() {
        List<Object[]> rows = entityManager.createQuery("""
                select a.slug, a.name, t.contentKey, t.title
                from Topic t join t.learningArea a
                where a.active = true and t.active = true
                order by a.displayOrder, a.id, t.displayOrder, t.id
                """, Object[].class).getResultList();
        Map<String, AreaAccumulator> areas = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String slug = (String) row[0];
            AreaAccumulator area = areas.computeIfAbsent(slug, ignored -> new AreaAccumulator(slug, (String) row[1]));
            area.topics.add(new SearchTopicFilterView((String) row[2], (String) row[3]));
        }
        return areas.values().stream().map(AreaAccumulator::toView).toList();
    }

    private static final class AreaAccumulator {
        private final String slug;
        private final String name;
        private final List<SearchTopicFilterView> topics = new ArrayList<>();

        private AreaAccumulator(String slug, String name) {
            this.slug = slug;
            this.name = name;
        }

        private SearchAreaFilterView toView() {
            return new SearchAreaFilterView(slug, name, List.copyOf(topics));
        }
    }
}
