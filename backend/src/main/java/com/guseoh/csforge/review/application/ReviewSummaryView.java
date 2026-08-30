package com.guseoh.csforge.review.application;

/**
 * 현재 시각 기준 복습 요약 수치이다.
 */
public record ReviewSummaryView(long overdue, long dueNow, long next24Hours, long next7Days, long mastered) {
}
