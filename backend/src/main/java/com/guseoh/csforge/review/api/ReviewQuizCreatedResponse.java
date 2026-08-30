package com.guseoh.csforge.review.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 복습 퀴즈 생성 결과의 HTTP 응답이다.
 */
public record ReviewQuizCreatedResponse(long quizId, QuizSessionStatus status, int questionCount, Instant startedAt, Instant expiresAt, int lastPosition, QuizSessionSource source) {
}
