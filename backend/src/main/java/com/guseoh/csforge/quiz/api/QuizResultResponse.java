package com.guseoh.csforge.quiz.api;

import java.util.List;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 제출된 Quiz 결과의 HTTP 응답이다.
 */
public record QuizResultResponse(
        long quizId,
        QuizSessionStatus status,
        QuizSessionSource source,
        int total,
        int correct,
        int wrong,
        int unanswered,
        int selfCheckPending,
        Double accuracy,
        List<QuizBreakdownResponse> breakdown,
        List<QuizQuestionResultResponse> questions) {
}
