package com.guseoh.csforge.search.api;

import java.util.List;

import com.guseoh.csforge.search.application.SearchAreaFilterView;

/** Search area/topic filter 선택지 HTTP 응답이다. */
public record SearchAreaFilterResponse(String areaSlug, String areaName, List<SearchTopicFilterResponse> topics) {
    static SearchAreaFilterResponse from(SearchAreaFilterView view) {
        return new SearchAreaFilterResponse(
                view.areaSlug(), view.areaName(), view.topics().stream().map(SearchTopicFilterResponse::from).toList());
    }
}
