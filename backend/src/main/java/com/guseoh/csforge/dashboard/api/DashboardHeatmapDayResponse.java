package com.guseoh.csforge.dashboard.api;

import java.time.LocalDate;

/** Dashboard heatmap의 하루 활동 응답이다. */
public record DashboardHeatmapDayResponse(
        LocalDate date,
        long conceptsViewed,
        long questionsSolved,
        long activityCount) {
}
