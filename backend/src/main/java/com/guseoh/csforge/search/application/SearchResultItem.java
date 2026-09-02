package com.guseoh.csforge.search.application;

import java.time.Instant;
import java.util.List;

/** Elasticsearch hit를 HTTP 표현과 분리해 전달하는 Search application item이다. */
public record SearchResultItem(
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
}
