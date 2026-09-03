package com.guseoh.csforge.search.api;

import com.guseoh.csforge.search.application.SearchProductState;
import com.guseoh.csforge.search.application.SearchStatusView;

/** Search recovery UI에 필요한 제품 상태 HTTP 응답이다. */
public record SearchStatusResponse(
        SearchProductState state,
        long indexedDocuments,
        long pendingOutboxEvents) {

    static SearchStatusResponse from(SearchStatusView view) {
        return new SearchStatusResponse(view.state(), view.indexedDocuments(), view.pendingOutboxEvents());
    }
}
