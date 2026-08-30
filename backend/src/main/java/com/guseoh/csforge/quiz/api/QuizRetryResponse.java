package com.guseoh.csforge.quiz.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

public record QuizRetryResponse(
        long quizId,
        QuizSessionStatus status,
        int questionCount,
        Instant startedAt,
        Instant expiresAt) {
}
