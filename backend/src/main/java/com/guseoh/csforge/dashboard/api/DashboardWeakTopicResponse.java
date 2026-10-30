package com.guseoh.csforge.dashboard.api;

/** 최근 30일 근거로 계산한 약점 Topic API 응답이다. */
public record DashboardWeakTopicResponse(
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
