package com.guseoh.csforge.publiccontent.api;

import com.guseoh.csforge.publiccontent.application.PublicTopicView;

/** 공개 콘텐츠의 HTTP 응답이다. */
public record PublicTopicResponse(
        long id,
        String slug,
        String title,
        String description,
        long publishedConceptCount,
        long level1Count,
        long level2Count,
        long level3Count) {
    static PublicTopicResponse from(PublicTopicView view) {
        return new PublicTopicResponse(
                view.id(),
                view.slug(),
                view.title(),
                view.description(),
                view.publishedConceptCount(),
                view.level1Count(),
                view.level2Count(),
                view.level3Count());
    }
}
