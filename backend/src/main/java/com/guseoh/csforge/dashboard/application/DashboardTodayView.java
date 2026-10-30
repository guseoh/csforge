package com.guseoh.csforge.dashboard.application;

/** 설정된 학습일의 문제 풀이·복습 대기 지표이다. */
public record DashboardTodayView(
        long solvedCount,
        long correctCount,
        long wrongCount,
        double accuracyPercent,
        long reviewDueCount) {
}
