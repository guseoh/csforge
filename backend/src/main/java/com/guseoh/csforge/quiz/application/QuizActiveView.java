package com.guseoh.csforge.quiz.application;

import java.time.Instant;

/**
 * 재개 가능한 진행 중 퀴즈의 요약 정보를 전달하는 조회 모델이다.
 */
public record QuizActiveView(
        long quizId,
        int questionCount,
        int answeredCount,
        int lastPosition,
        Instant startedAt,
        Instant expiresAt) {
}
