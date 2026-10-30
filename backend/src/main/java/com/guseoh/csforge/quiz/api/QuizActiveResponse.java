package com.guseoh.csforge.quiz.api;

import java.time.Instant;

public record QuizActiveResponse(
        long quizId,
        int questionCount,
        int answeredCount,
        int lastPosition,
        Instant startedAt,
        Instant expiresAt) {
}
