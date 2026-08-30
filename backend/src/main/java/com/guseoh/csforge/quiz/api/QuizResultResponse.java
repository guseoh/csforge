package com.guseoh.csforge.quiz.api;

import java.util.List;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

public record QuizResultResponse(
        long quizId,
        QuizSessionStatus status,
        int total,
        int correct,
        int wrong,
        int unanswered,
        int selfCheckPending,
        Double accuracy,
        List<QuizBreakdownResponse> breakdown,
        List<QuizQuestionResultResponse> questions) {
}
