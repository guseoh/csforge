package com.guseoh.csforge.dashboard.api;

/** Concept level별 진행률 API 응답이다. */
public record DashboardLevelProgressResponse(
        short level,
        long completed,
        long total,
        double completionPercent) {
}
