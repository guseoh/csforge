package com.guseoh.csforge.search.api;

import com.guseoh.csforge.search.application.SearchStatusView;

/** PostgreSQL Search의 현재 상태와 검색 가능 문서 수를 담는 HTTP 응답이다. */
public record SearchStatusResponse(
        String state,
        long searchableDocuments) {

    static SearchStatusResponse from(SearchStatusView view) {
        return new SearchStatusResponse("READY", view.searchableDocuments());
    }
}
