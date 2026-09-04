package com.guseoh.csforge.dashboard.application;

import java.time.LocalDate;

/** 하루의 Concept 열람과 finalized Attempt 활동을 표현한다. */
public record DashboardHeatmapDayView(
        LocalDate date,
        long conceptsViewed,
        long questionsSolved,
        long activityCount) {
}
