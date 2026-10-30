package com.guseoh.csforge.dashboard.infrastructure;

/** Weak Topic 계산에 필요한 Attempt-Topic 연결 projection이다. */
public record DashboardWeakTopicProjection(
        long attemptId,
        boolean correct,
        long topicId,
        String topicContentKey,
        String topicTitle,
        String areaSlug,
        String areaName) {
}
