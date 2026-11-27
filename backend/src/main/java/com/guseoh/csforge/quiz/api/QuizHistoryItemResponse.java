package com.guseoh.csforge.quiz.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * 퀴즈 이력 목록의 단일 항목 HTTP 응답 모델이다.
 */
public record QuizHistoryItemResponse(
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
