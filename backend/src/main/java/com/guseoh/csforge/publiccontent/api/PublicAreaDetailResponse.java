package com.guseoh.csforge.publiccontent.api;

import java.util.List;

import com.guseoh.csforge.publiccontent.application.PublicAreaDetailView;

/** 공개 콘텐츠의 HTTP 응답이다. */
public record PublicAreaDetailResponse(
        long id,
        String slug,
        String name,
        String description,
        List<PublicTopicResponse> topics) {
    static PublicAreaDetailResponse from(PublicAreaDetailView view) {
        return new PublicAreaDetailResponse(
                view.id(),
                view.slug(),
                view.name(),
                view.description(),
                view.topics().stream().map(PublicTopicResponse::from).toList());
    }
}
