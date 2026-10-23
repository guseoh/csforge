package com.guseoh.csforge.publiccontent.api;

import java.util.List;

import com.guseoh.csforge.learning.api.PageMetadataResponse;
import com.guseoh.csforge.publiccontent.application.PublicConceptPageView;

/** 공개 콘텐츠의 HTTP 응답이다. */
public record PublicConceptPageResponse(
        List<PublicConceptItemResponse> items,
        PageMetadataResponse page) {
    static PublicConceptPageResponse from(PublicConceptPageView view) {
        return new PublicConceptPageResponse(
                view.items().stream().map(PublicConceptItemResponse::from).toList(),
                new PageMetadataResponse(view.page().page(), view.page().size(), view.page().totalElements(),
                        view.page().totalPages(), view.page().hasNext(), view.page().hasPrevious()));
    }
}
