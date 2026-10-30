package com.guseoh.csforge.search.application;

/** Ctrl/Cmd+K와 Search 입력창에 제공하는 title 중심 suggestion이다. */
public record SearchSuggestionView(
        SearchDocumentType documentType,
        long sourceId,
        String title,
        Long conceptId,
        Long questionId,
        String referenceUrl) {
}
