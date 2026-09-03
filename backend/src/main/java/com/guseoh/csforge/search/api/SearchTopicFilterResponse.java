package com.guseoh.csforge.search.api;

import com.guseoh.csforge.search.application.SearchTopicFilterView;

/** Search Topic filter 선택지 HTTP 응답이다. */
public record SearchTopicFilterResponse(String contentKey, String title) {
    static SearchTopicFilterResponse from(SearchTopicFilterView view) {
        return new SearchTopicFilterResponse(view.contentKey(), view.title());
    }
}
