package com.guseoh.csforge.dashboard.api;

import java.util.List;

/** LearningArea 진행률 API 응답이다. */
public record DashboardAreaProgressResponse(
        String areaSlug,
        String areaName,
        long completedConceptCount,
        long publishedConceptCount,
        double completionPercent,
        List<DashboardLevelProgressResponse> levels) {

    public DashboardAreaProgressResponse {
        levels = List.copyOf(levels);
    }
}
