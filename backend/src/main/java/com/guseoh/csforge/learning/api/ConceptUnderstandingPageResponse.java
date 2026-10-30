package com.guseoh.csforge.learning.api;

import java.util.List;
import com.guseoh.csforge.learning.application.ConceptUnderstandingPageView;

/** Area/Topic 범위의 bounded 이해도 근거 페이지이다. */
public record ConceptUnderstandingPageResponse(
        List<ConceptUnderstandingResponse> items,
        PageMetadataResponse page) {

    public static ConceptUnderstandingPageResponse from(ConceptUnderstandingPageView view) {
        return new ConceptUnderstandingPageResponse(
                view.items().stream().map(ConceptUnderstandingResponse::from).toList(),
                new PageMetadataResponse(
                        view.page().page(), view.page().size(), view.page().totalElements(),
                        view.page().totalPages(), view.page().hasNext(), view.page().hasPrevious()));
    }
}
