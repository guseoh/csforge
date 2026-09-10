package com.guseoh.csforge.search.application;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Search query, suggestion, filter, product status 조회를 조정한다. */
@Service
@RequiredArgsConstructor
public class SearchQueryService {

    private final SearchQueryGateway searchQueryGateway;
    private final SearchFilterOptionsProvider filterOptionsProvider;

    public SearchPageView search(SearchCriteria criteria) {
        return searchQueryGateway.search(criteria);
    }

    public List<SearchSuggestionView> suggest(String query, int size) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isBlank()) return List.of();
        if (normalized.length() > 100) throw new IllegalArgumentException("q must be at most 100 characters");
        if (size < 1 || size > 10) throw new IllegalArgumentException("size must be between 1 and 10");
        return searchQueryGateway.suggest(normalized, size);
    }

    public List<SearchAreaFilterView> filterOptions() {
        return filterOptionsProvider.load();
    }

    public SearchStatusView status() {
        return new SearchStatusView(searchQueryGateway.countSearchableDocuments());
    }
}
