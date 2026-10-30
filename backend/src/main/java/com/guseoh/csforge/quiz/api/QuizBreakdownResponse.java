package com.guseoh.csforge.quiz.api;

public record QuizBreakdownResponse(
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
