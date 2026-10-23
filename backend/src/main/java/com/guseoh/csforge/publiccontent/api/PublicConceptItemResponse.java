package com.guseoh.csforge.publiccontent.api;

import com.guseoh.csforge.publiccontent.application.PublicConceptItemView;

/** 공개 콘텐츠의 HTTP 응답이다. */
public record PublicConceptItemResponse(
        long id,
        String areaSlug,
        String areaName,
        long topicId,
        String topicSlug,
        String topicTitle,
        String title,
        String summary,
        short level) {
    static PublicConceptItemResponse from(PublicConceptItemView view) {
        return new PublicConceptItemResponse(
                view.id(),
                view.areaSlug(),
                view.areaName(),
                view.topicId(),
                view.topicSlug(),
                view.topicTitle(),
                view.title(),
                view.summary(),
                view.level());
    }
}
