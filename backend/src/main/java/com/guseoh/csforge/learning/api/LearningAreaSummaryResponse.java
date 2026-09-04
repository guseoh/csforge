package com.guseoh.csforge.learning.api;

/**
 * Learning Area 목록의 progress와 practice metric HTTP 응답이다.
 */
public record LearningAreaSummaryResponse(
        long id,
        String slug,
        String name,
        String description,
        long topicCount,
        long publishedConceptCount,
        long completedConceptCount,
        long bookmarkedConceptCount,
        LevelProgressResponse level1,
        LevelProgressResponse level2,
        LevelProgressResponse level3,
        long publishedQuestionCount,
        long finalizedAttemptCount,
        long correctAttemptCount,
        double accuracyPercent) {
}
