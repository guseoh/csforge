package com.guseoh.csforge.learning.application;

public record LearningAreaSummaryView(
        long id,
        String slug,
        String name,
        String description,
        long topicCount,
        long publishedConceptCount,
        long completedConceptCount,
        long bookmarkedConceptCount,
        long level1Total,
        long level1Completed,
        long level2Total,
        long level2Completed,
        long level3Total,
        long level3Completed) {
}
