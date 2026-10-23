package com.guseoh.csforge.search.api;

import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchSuggestionView;

/** Search title suggestion HTTP 응답이다. */
public record PublicSearchSuggestionResponse(
        SearchDocumentType documentType,
        long sourceId,
        String title,
        Long conceptId,
        String referenceUrl) {

    static PublicSearchSuggestionResponse from(SearchSuggestionView view) {
        return new PublicSearchSuggestionResponse(
                view.documentType(), view.sourceId(), view.title(), view.conceptId(), view.referenceUrl());
    }
}
