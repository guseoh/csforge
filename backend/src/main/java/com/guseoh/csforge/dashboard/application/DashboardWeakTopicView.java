package com.guseoh.csforge.dashboard.application;

/** 최근 오답 근거가 충분한 약점 Topic의 집계 결과이다. */
public record DashboardWeakTopicView(
        long topicId,
        String topicContentKey,
        String topicTitle,
        String areaSlug,
        String areaName,
        long attemptCount,
        long correctCount,
        long wrongCount,
        double accuracyPercent) {
}
