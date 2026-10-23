package com.guseoh.csforge.search.api;

import java.util.List;

import com.guseoh.csforge.search.application.SearchPageView;

/** Search page HTTP 응답이다. */
public record PublicSearchPageResponse(
        String query,
        int page,
        int size,
        long totalHits,
        int totalPages,
        long tookMillis,
        List<PublicSearchResultItemResponse> items) {

    static PublicSearchPageResponse from(SearchPageView view) {
        return new PublicSearchPageResponse(
                view.query(), view.page(), view.size(), view.totalHits(), view.totalPages(), view.tookMillis(),
                view.items().stream().map(PublicSearchResultItemResponse::from).toList());
    }
}
