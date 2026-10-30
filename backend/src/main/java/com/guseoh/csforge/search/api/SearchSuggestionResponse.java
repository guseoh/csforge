package com.guseoh.csforge.search.api;

import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchSuggestionView;

/** Search title suggestion HTTP 응답이다. */
public record SearchSuggestionResponse(
        SearchDocumentType documentType,
        long sourceId,
        String title,
        Long conceptId,
        Long questionId,
        String referenceUrl) {

    static SearchSuggestionResponse from(SearchSuggestionView view) {
        return new SearchSuggestionResponse(
                view.documentType(), view.sourceId(), view.title(), view.conceptId(), view.questionId(), view.referenceUrl());
    }
}
