package com.guseoh.csforge.quiz.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 새 Quiz 세션 생성 결과의 HTTP 응답이다.
 */
public record QuizCreatedResponse(
        long quizId,
        QuizSessionStatus status,
        int questionCount,
        Instant startedAt,
        Instant expiresAt,
        int lastPosition,
        QuizSessionSource source) {
}
