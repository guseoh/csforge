package com.guseoh.csforge.dashboard.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Dashboard API에 전달할 PostgreSQL 기반 read model이다. */
public record DashboardView(
        Instant asOf,
        LocalDate studyDate,
        String zoneId,
        DashboardTodayView today,
        int currentStreak,
        List<DashboardHeatmapDayView> heatmap,
        List<DashboardAreaProgressView> areaProgress,
        List<DashboardWeakTopicView> weakTopics,
        List<DashboardRecentQuizView> recentQuizzes,
        DashboardActiveQuizView activeQuiz) {

    public DashboardView {
        heatmap = List.copyOf(heatmap);
        areaProgress = List.copyOf(areaProgress);
        weakTopics = List.copyOf(weakTopics);
        recentQuizzes = List.copyOf(recentQuizzes);
    }
}
