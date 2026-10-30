package com.guseoh.csforge.quiz.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * 퀴즈 제출 후 상태와 자기채점 대기 수를 전달하는 애플리케이션 결과 모델이다.
 */
public record QuizSubmissionResult(
        long quizId,
        QuizSessionStatus status,
        Instant submittedAt,
        Instant completedAt,
        int selfCheckPendingCount) {
}
