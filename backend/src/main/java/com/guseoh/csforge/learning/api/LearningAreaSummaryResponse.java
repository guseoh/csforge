package com.guseoh.csforge.learning.api;

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
        LevelProgressResponse level3) {
}
