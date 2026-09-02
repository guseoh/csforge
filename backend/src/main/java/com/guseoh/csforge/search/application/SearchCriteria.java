package com.guseoh.csforge.search.application;

import java.util.List;

/** 통합 Search query의 검증된 application 입력이다. */
public record SearchCriteria(
        String query,
        List<SearchDocumentType> documentTypes,
        List<String> areaSlugs,
        List<String> topicContentKeys,
        List<Integer> levels,
        SearchSort sort,
        int page,
        int size) {

    private static final int MAX_QUERY_LENGTH = 200;
    private static final int MAX_SIZE = 50;
    private static final int MAX_RESULT_WINDOW = 10_000;

    public SearchCriteria {
        query = query == null ? "" : query.trim();
        if (query.isBlank()) throw new IllegalArgumentException("q is required");
        if (query.length() > MAX_QUERY_LENGTH) throw new IllegalArgumentException("q must be at most 200 characters");
        documentTypes = documentTypes == null ? List.of() : List.copyOf(documentTypes);
        areaSlugs = normalize(areaSlugs);
        topicContentKeys = normalize(topicContentKeys);
        levels = levels == null ? List.of() : levels.stream().distinct().toList();
        if (levels.stream().anyMatch(level -> level == null || level < 1 || level > 3)) {
            throw new IllegalArgumentException("level must be between 1 and 3");
        }
        sort = sort == null ? SearchSort.RELEVANCE : sort;
        if (page < 0) throw new IllegalArgumentException("page must be at least 0");
        if (size < 1 || size > MAX_SIZE) throw new IllegalArgumentException("size must be between 1 and 50");
        long from = (long) page * size;
        if (from + size > MAX_RESULT_WINDOW) {
            throw new IllegalArgumentException("Search page exceeds the supported result window");
        }
    }

    public int from() {
        return Math.multiplyExact(page, size);
    }

    private static List<String> normalize(List<String> values) {
        if (values == null) return List.of();
        return values.stream().filter(java.util.Objects::nonNull).map(String::trim).filter(value -> !value.isBlank()).distinct().toList();
    }
}
