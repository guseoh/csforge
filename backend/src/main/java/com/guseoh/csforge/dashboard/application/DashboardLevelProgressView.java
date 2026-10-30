package com.guseoh.csforge.dashboard.application;

/** LearningArea 안의 한 Concept level 진행률이다. */
public record DashboardLevelProgressView(
        short level,
        long completed,
        long total,
        double completionPercent) {
}
