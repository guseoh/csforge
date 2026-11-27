package com.guseoh.csforge.quiz.domain;

/**
 * 퀴즈 세션별 시도 채점 집계를 담는 읽기 프로젝션이다.
 */
public record QuizSessionAttemptSummary(
        long quizId,
        long totalCount,
        long correctCount,
        long wrongCount,
        long unansweredCount,
        long selfCheckPendingCount) {
}
