package com.guseoh.csforge.dashboard.api;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.dashboard.application.DashboardActiveQuizView;
import com.guseoh.csforge.dashboard.application.DashboardAreaProgressView;
import com.guseoh.csforge.dashboard.application.DashboardHeatmapDayView;
import com.guseoh.csforge.dashboard.application.DashboardLevelProgressView;
import com.guseoh.csforge.dashboard.application.DashboardRecentQuizView;
import com.guseoh.csforge.dashboard.application.DashboardTodayView;
import com.guseoh.csforge.dashboard.application.DashboardView;
import com.guseoh.csforge.dashboard.application.DashboardWeakTopicView;

/** Dashboard application view를 HTTP response 계약으로 변환한다. */
@Component
public class DashboardApiMapper {

    public DashboardResponse toResponse(DashboardView view) {
        return new DashboardResponse(
                view.asOf(),
                view.studyDate(),
                view.zoneId(),
                toToday(view.today()),
                view.currentStreak(),
                view.heatmap().stream().map(this::toHeatmapDay).toList(),
                view.areaProgress().stream().map(this::toAreaProgress).toList(),
                view.weakTopics().stream().map(this::toWeakTopic).toList(),
                view.recentQuizzes().stream().map(this::toRecentQuiz).toList(),
                view.activeQuiz() == null ? null : toActiveQuiz(view.activeQuiz()));
    }

    private DashboardTodayResponse toToday(DashboardTodayView today) {
        return new DashboardTodayResponse(
                today.solvedCount(),
                today.correctCount(),
                today.wrongCount(),
                today.accuracyPercent(),
                today.reviewDueCount());
    }

    private DashboardHeatmapDayResponse toHeatmapDay(DashboardHeatmapDayView day) {
        return new DashboardHeatmapDayResponse(
                day.date(), day.conceptsViewed(), day.questionsSolved(), day.activityCount());
    }

    private DashboardAreaProgressResponse toAreaProgress(DashboardAreaProgressView area) {
        return new DashboardAreaProgressResponse(
                area.areaSlug(),
                area.areaName(),
                area.completedConceptCount(),
                area.publishedConceptCount(),
                area.completionPercent(),
                area.levels().stream().map(this::toLevelProgress).toList());
    }

    private DashboardLevelProgressResponse toLevelProgress(DashboardLevelProgressView level) {
        return new DashboardLevelProgressResponse(
                level.level(), level.completed(), level.total(), level.completionPercent());
    }

    private DashboardWeakTopicResponse toWeakTopic(DashboardWeakTopicView topic) {
        return new DashboardWeakTopicResponse(
                topic.topicId(),
                topic.topicContentKey(),
                topic.topicTitle(),
                topic.areaSlug(),
                topic.areaName(),
                topic.attemptCount(),
                topic.correctCount(),
                topic.wrongCount(),
                topic.accuracyPercent());
    }

    private DashboardRecentQuizResponse toRecentQuiz(DashboardRecentQuizView quiz) {
        return new DashboardRecentQuizResponse(
                quiz.quizId(),
                quiz.source(),
                quiz.status(),
                quiz.startedAt(),
                quiz.submittedAt(),
                quiz.completedAt(),
                quiz.totalCount(),
                quiz.finalizedCount(),
                quiz.correctCount(),
                quiz.wrongCount(),
                quiz.pendingSelfCheckCount(),
                quiz.accuracyPercent());
    }

    private DashboardActiveQuizResponse toActiveQuiz(DashboardActiveQuizView quiz) {
        return new DashboardActiveQuizResponse(
                quiz.quizId(),
                quiz.questionCount(),
                quiz.answeredCount(),
                quiz.lastPosition(),
                quiz.startedAt(),
                quiz.expiresAt());
    }
}
