package com.guseoh.csforge.search.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

/** Search API가 Elasticsearch result window와 필터 범위를 안전하게 제한하는지 검증한다. */
class SearchCriteriaTest {

    @Test
    void normalizesQueryAndAcceptsMaximumPageSize() {
        SearchCriteria criteria = criteria("  HashMap  ", List.of(1, 3), 0, 50);

        assertEquals("HashMap", criteria.query());
        assertEquals(50, criteria.size());
        assertEquals(0, criteria.from());
    }

    @Test
    void rejectsBlankOversizedDeepOffsetAndInvalidLevel() {
        assertThrows(IllegalArgumentException.class, () -> criteria("   ", List.of(), 0, 20));
        assertThrows(IllegalArgumentException.class, () -> criteria("x".repeat(201), List.of(), 0, 20));
        assertThrows(IllegalArgumentException.class, () -> criteria("HashMap", List.of(), 0, 51));
        assertThrows(IllegalArgumentException.class, () -> criteria("HashMap", List.of(), 200, 50));
        assertThrows(IllegalArgumentException.class, () -> criteria("HashMap", List.of(4), 0, 20));
    }

    private SearchCriteria criteria(String query, List<Integer> levels, int page, int size) {
        return new SearchCriteria(
                query,
                List.of(),
                List.of(),
                List.of(),
                levels,
                SearchSort.RELEVANCE,
                page,
                size);
    }
}
