package com.guseoh.csforge.dashboard.application;

import java.util.List;

/** 활성 LearningArea 하나의 전체·레벨별 진행률이다. */
public record DashboardAreaProgressView(
        String areaSlug,
        String areaName,
        long completedConceptCount,
        long publishedConceptCount,
        double completionPercent,
        List<DashboardLevelProgressView> levels) {

    public DashboardAreaProgressView {
        levels = List.copyOf(levels);
    }
}
