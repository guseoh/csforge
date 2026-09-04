package com.guseoh.csforge.learning.application;

/**
 * Learning Area summary와 practice metric을 담는 application 조회 모델이다.
 */
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
        long level3Completed,
        long publishedQuestionCount,
        long finalizedAttemptCount,
        long correctAttemptCount,
        double accuracyPercent) {

    public LearningAreaSummaryView(
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
        this(id, slug, name, description, topicCount, publishedConceptCount, completedConceptCount,
                bookmarkedConceptCount, level1Total, level1Completed, level2Total, level2Completed,
                level3Total, level3Completed, 0, 0, 0, 0.0);
    }

    public LearningAreaSummaryView withPracticeMetrics(
            long publishedQuestionCount,
            long finalizedAttemptCount,
            long correctAttemptCount) {
        double accuracyPercent = finalizedAttemptCount == 0
                ? 0.0
                : (double) correctAttemptCount * 100 / finalizedAttemptCount;
        return new LearningAreaSummaryView(
                id, slug, name, description, topicCount, publishedConceptCount, completedConceptCount,
                bookmarkedConceptCount, level1Total, level1Completed, level2Total, level2Completed,
                level3Total, level3Completed, publishedQuestionCount, finalizedAttemptCount,
                correctAttemptCount, accuracyPercent);
    }
}
