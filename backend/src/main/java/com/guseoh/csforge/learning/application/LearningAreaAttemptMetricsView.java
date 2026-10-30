package com.guseoh.csforge.learning.application;

/**
 * Area별 finalized Attempt와 정답 Attempt distinct count projection이다.
 */
public record LearningAreaAttemptMetricsView(long areaId, long finalizedAttemptCount, long correctAttemptCount) {
}
