package com.guseoh.csforge.learning.application;

import com.guseoh.csforge.learning.domain.LearningStatus;

public record ConceptSearchCriteria(
        String areaSlug,
        Long topicId,
        Short level,
        LearningStatus learningStatus,
        Boolean bookmarked,
        String query,
        int page,
        int size,
        ConceptSort sort,
        Long bookmarkCategoryId) {

    public ConceptSearchCriteria {
        areaSlug = normalize(areaSlug);
        query = normalize(query);
        if (page < 0 || page > 1_000_000) {
            throw new LearningBadRequestException("page must be between 0 and 1000000");
        }
        if (size < 1 || size > 100) {
            throw new LearningBadRequestException("size must be between 1 and 100");
        }
        if (level != null && (level < 1 || level > 3)) {
            throw new LearningBadRequestException("level must be between 1 and 3");
        }
        if (topicId != null && topicId < 1) {
            throw new LearningBadRequestException("topic must be a positive id");
        }
        if (query != null && query.length() > 200) {
            throw new LearningBadRequestException("q must be at most 200 characters");
        }
        if (bookmarkCategoryId != null && bookmarkCategoryId <= 0) {
            throw new LearningBadRequestException("bookmarkCategoryId must be a positive id");
        }
        if (sort == null) {
            sort = ConceptSort.CURRICULUM;
        }
    }

    public ConceptSearchCriteria(String areaSlug, Long topicId, Short level, LearningStatus learningStatus,
            Boolean bookmarked, String query, int page, int size, ConceptSort sort) {
        this(areaSlug, topicId, level, learningStatus, bookmarked, query, page, size, sort, null);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
