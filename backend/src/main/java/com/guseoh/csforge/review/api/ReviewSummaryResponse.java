package com.guseoh.csforge.review.api;

/**
 * 복습 요약 수치의 HTTP 응답이다.
 */
public record ReviewSummaryResponse(long overdue, long dueNow, long next24Hours, long next7Days, long mastered) {
}
