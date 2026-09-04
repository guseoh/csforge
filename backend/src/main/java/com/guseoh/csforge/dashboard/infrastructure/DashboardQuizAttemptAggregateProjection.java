package com.guseoh.csforge.dashboard.infrastructure;

/** 최근 Quiz의 Attempt 상태별 집계 projection이다. */
public record DashboardQuizAttemptAggregateProjection(
        long quizId,
        long attemptCount,
        long finalizedCount,
        long correctCount,
        long wrongCount,
        long pendingSelfCheckCount) {
}
