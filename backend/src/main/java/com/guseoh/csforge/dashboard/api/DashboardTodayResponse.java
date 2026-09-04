package com.guseoh.csforge.dashboard.api;

/** 오늘 학습 지표를 반환하는 API 응답이다. */
public record DashboardTodayResponse(
        long solvedCount,
        long correctCount,
        long wrongCount,
        double accuracyPercent,
        long reviewDueCount) {
}
