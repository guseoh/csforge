package com.guseoh.csforge.quiz.application;

/**
 * 학습 영역과 토픽별 퀴즈 채점 집계를 전달하는 조회 모델이다.
 */
public record QuizBreakdownView(
        String areaSlug,
        String areaName,
        String topicSlug,
        String topicTitle,
        int total,
        int correct,
        int wrong,
        int unanswered,
        int selfCheckPending) {
}
