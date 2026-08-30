package com.guseoh.csforge.quiz.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

public record QuizSubmissionResponse(
        long quizId,
        QuizSessionStatus status,
        Instant submittedAt,
        Instant completedAt,
        int selfCheckPendingCount) {
}
