package com.guseoh.csforge.search.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchResultItem;

/** Search hit 한 건의 안전한 highlight/navigation HTTP 응답이다. */
public record SearchResultItemResponse(
        SearchDocumentType documentType,
        long sourceId,
        String title,
        String highlightedTitle,
        String snippet,
        List<String> areaSlugs,
        List<String> areaNames,
        List<String> topicContentKeys,
        List<String> topicTitles,
        List<Integer> levels,
        Instant updatedAt,
        Long conceptId,
        Long questionId,
        String referenceUrl) {

    static SearchResultItemResponse from(SearchResultItem item) {
        return new SearchResultItemResponse(
                item.documentType(), item.sourceId(), item.title(), item.highlightedTitle(), item.snippet(),
                item.areaSlugs(), item.areaNames(), item.topicContentKeys(), item.topicTitles(), item.levels(),
                item.updatedAt(), item.conceptId(), item.questionId(), item.referenceUrl());
    }
}
