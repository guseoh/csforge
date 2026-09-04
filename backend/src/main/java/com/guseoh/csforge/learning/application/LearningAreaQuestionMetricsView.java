package com.guseoh.csforge.learning.application;

/**
 * Area별 published Question distinct count projection이다.
 */
public record LearningAreaQuestionMetricsView(long areaId, long publishedQuestionCount) {
}
