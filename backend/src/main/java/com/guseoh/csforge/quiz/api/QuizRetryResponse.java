package com.guseoh.csforge.quiz.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 오답 재시작 Quiz 생성 결과의 HTTP 응답이다.
 */
public record QuizRetryResponse(
        long quizId,
        QuizSessionStatus status,
        int questionCount,
        Instant startedAt,
        Instant expiresAt,
        QuizSessionSource source) {
}
