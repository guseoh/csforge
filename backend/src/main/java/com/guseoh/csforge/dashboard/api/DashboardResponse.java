package com.guseoh.csforge.dashboard.api;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** daily-use 학습 Dashboard API 응답이다. */
public record DashboardResponse(
        Instant asOf,
        LocalDate studyDate,
        String zoneId,
        DashboardTodayResponse today,
        int currentStreak,
        List<DashboardHeatmapDayResponse> heatmap,
        List<DashboardAreaProgressResponse> areaProgress,
        List<DashboardWeakTopicResponse> weakTopics,
        List<DashboardRecentQuizResponse> recentQuizzes,
        DashboardActiveQuizResponse activeQuiz) {

    public DashboardResponse {
        heatmap = List.copyOf(heatmap);
        areaProgress = List.copyOf(areaProgress);
        weakTopics = List.copyOf(weakTopics);
        recentQuizzes = List.copyOf(recentQuizzes);
    }
}
