package com.guseoh.csforge.quiz.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

public record QuizSessionResponse(
        long quizId,
        QuizSessionStatus status,
        Instant startedAt,
        Instant submittedAt,
        Instant completedAt,
        Instant expiresAt,
        boolean expired,
        int lastPosition,
        int answeredCount,
        List<QuizQuestionResponse> questions) {
}
