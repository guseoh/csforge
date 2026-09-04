package com.guseoh.csforge.dashboard.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/** 최근 제출 또는 완료 Quiz API 응답이다. */
public record DashboardRecentQuizResponse(
        long quizId,
        QuizSessionSource source,
        QuizSessionStatus status,
        Instant startedAt,
        Instant submittedAt,
        Instant completedAt,
        long totalCount,
        long finalizedCount,
        long correctCount,
        long wrongCount,
        long pendingSelfCheckCount,
        double accuracyPercent) {
}
