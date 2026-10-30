package com.guseoh.csforge.quiz.api;

import java.time.Instant;

public record QuizAnswerSavedResponse(
        long questionId,
        String selectedChoiceKey,
        String answerText,
        boolean reviewNeeded,
        Instant answeredAt) {
}
