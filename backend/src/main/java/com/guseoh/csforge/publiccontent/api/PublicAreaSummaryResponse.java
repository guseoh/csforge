package com.guseoh.csforge.publiccontent.api;

import com.guseoh.csforge.publiccontent.application.PublicAreaSummaryView;

/** 공개 콘텐츠의 HTTP 응답이다. */
public record PublicAreaSummaryResponse(
        long id,
        String slug,
        String name,
        String description,
        long topicCount,
        long publishedConceptCount) {
    static PublicAreaSummaryResponse from(PublicAreaSummaryView view) {
        return new PublicAreaSummaryResponse(
                view.id(),
                view.slug(),
                view.name(),
                view.description(),
                view.topicCount(),
                view.publishedConceptCount());
    }
}
