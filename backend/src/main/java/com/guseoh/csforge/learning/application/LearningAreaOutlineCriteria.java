package com.guseoh.csforge.learning.application;

/** 영역 목차를 bounded page로 조회하기 위한 입력이다. */
public record LearningAreaOutlineCriteria(String areaSlug, int page, int size) {

    public LearningAreaOutlineCriteria {
        if (areaSlug == null || areaSlug.isBlank()) {
            throw new LearningBadRequestException("areaSlug must not be blank");
        }
        if (page < 0 || page > 1_000_000) {
            throw new LearningBadRequestException("page must be between 0 and 1000000");
        }
        if (size < 1 || size > 200) {
            throw new LearningBadRequestException("size must be between 1 and 200");
        }
        areaSlug = areaSlug.trim();
    }
}
