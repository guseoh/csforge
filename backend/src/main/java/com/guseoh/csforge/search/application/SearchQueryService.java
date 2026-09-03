package com.guseoh.csforge.search.application;

import java.util.List;

import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Search query, suggestion, filter, product status 조회를 조정한다. */
@Service
@RequiredArgsConstructor
public class SearchQueryService {

    private final SearchEngineGateway searchEngineGateway;
    private final SearchFilterOptionsProvider filterOptionsProvider;
    private final SearchOutboxEventRepository outboxRepository;
    private final SearchReindexState reindexState;

    public SearchPageView search(SearchCriteria criteria) {
        requireReady();
        return searchEngineGateway.search(criteria);
    }

    public List<SearchSuggestionView> suggest(String query, int size) {
        String normalized = query == null ? "" : query.trim();
        if (normalized.isBlank()) return List.of();
        if (normalized.length() > 100) throw new IllegalArgumentException("q must be at most 100 characters");
        if (size < 1 || size > 10) throw new IllegalArgumentException("size must be between 1 and 10");
        requireReady();
        return searchEngineGateway.suggest(normalized, size);
    }

    public List<SearchAreaFilterView> filterOptions() {
        return filterOptionsProvider.load();
    }

    public SearchStatusView status() {
        SearchEngineState engineState = searchEngineGateway.state();
        SearchProductState productState;
        if (reindexState.isReindexing()) productState = SearchProductState.REINDEXING;
        else if (engineState == SearchEngineState.READY) productState = SearchProductState.READY;
        else if (engineState == SearchEngineState.NOT_READY) productState = SearchProductState.NOT_READY;
        else productState = SearchProductState.UNAVAILABLE;
        long count = engineState == SearchEngineState.READY ? searchEngineGateway.countDocuments() : 0;
        return new SearchStatusView(productState, count, outboxRepository.countByPublishedAtIsNull());
    }

    private void requireReady() {
        SearchEngineState state = searchEngineGateway.state();
        if (state == SearchEngineState.NOT_READY) throw new SearchNotReadyException();
        if (state == SearchEngineState.UNAVAILABLE) throw new SearchUnavailableException("Search infrastructure is unavailable");
    }
}
