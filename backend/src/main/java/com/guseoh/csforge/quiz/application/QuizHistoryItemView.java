package com.guseoh.csforge.quiz.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * 퀴즈 이력 목록의 단일 세션 요약 애플리케이션 뷰이다.
 */
public record QuizHistoryItemView(
        long quizId,
        QuizSessionStatus status,
        QuizSessionSource source,
        int total,
        int correct,
        int wrong,
        int unanswered,
        int selfCheckPending,
        Double accuracy,
        Instant startedAt,
        Instant submittedAt,
        Instant completedAt) {
}
