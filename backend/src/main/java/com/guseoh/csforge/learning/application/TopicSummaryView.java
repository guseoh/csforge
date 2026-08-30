package com.guseoh.csforge.learning.application;

public record TopicSummaryView(
        long id,
        String slug,
        String title,
        String description,
        long publishedConceptCount,
        long completedConceptCount,
        long bookmarkedConceptCount,
        long level1Count,
        long level2Count,
        long level3Count,
        long unseenCount,
        long learningCount,
        long reviewNeededCount) {
}
