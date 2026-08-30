package com.guseoh.csforge.quiz.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 새로 생성된 퀴즈 세션의 기본 정보를 전달하는 애플리케이션 결과 모델이다.
 */
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
