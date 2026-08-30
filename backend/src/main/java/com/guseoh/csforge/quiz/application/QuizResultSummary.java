package com.guseoh.csforge.quiz.application;

/**
 * 퀴즈 전체의 채점 집계 결과를 표현하는 값 모델이다.
 */
public record QuizResultSummary(
        int total,
        int correct,
        int wrong,
        int unanswered,
        int selfCheckPending,
        Double accuracy) {
}
