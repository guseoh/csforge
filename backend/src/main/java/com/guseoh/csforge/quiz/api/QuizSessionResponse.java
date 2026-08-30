package com.guseoh.csforge.quiz.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 진행 중 Quiz 세션의 HTTP 응답이다.
 */
public record QuizSessionResponse(
        long quizId,
        QuizSessionStatus status,
        QuizSessionSource source,
        Instant startedAt,
        Instant submittedAt,
        Instant completedAt,
        Instant expiresAt,
        boolean expired,
        int lastPosition,
        int answeredCount,
        List<QuizQuestionResponse> questions) {
}
