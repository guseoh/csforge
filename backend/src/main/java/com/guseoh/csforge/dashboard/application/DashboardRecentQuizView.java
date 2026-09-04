package com.guseoh.csforge.dashboard.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/** 최근 완료 또는 제출 Quiz의 bounded 집계 결과이다. */
public record DashboardRecentQuizView(
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
