package com.guseoh.csforge.quiz.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * Quiz 세션 생성 유스케이스의 결과 모델이다.
 */
public record QuizCreatedResult(
        long quizId,
        QuizSessionStatus status,
        int questionCount,
        Instant startedAt,
        Instant expiresAt,
        int lastPosition,
        QuizSessionSource source) {
}
