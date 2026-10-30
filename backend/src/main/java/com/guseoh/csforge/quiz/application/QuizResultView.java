package com.guseoh.csforge.quiz.application;

import java.util.List;
import java.util.Map;

/**
 * 제출된 퀴즈의 상세 데이터와 집계 결과를 함께 전달하는 조회 모델이다.
 */
public record QuizResultView(
        QuizSessionData data,
        QuizPerformance performance,
        List<QuizBreakdownView> breakdown,
        Map<Long, QuizQuestionOutcomeView> questionOutcomes) {

    public QuizResultView {
        breakdown = List.copyOf(breakdown);
        questionOutcomes = Map.copyOf(questionOutcomes);
    }
}
