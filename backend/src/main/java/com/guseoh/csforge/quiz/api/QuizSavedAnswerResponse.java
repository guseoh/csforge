package com.guseoh.csforge.quiz.api;

import java.time.Instant;

public record QuizSavedAnswerResponse(
        String selectedChoiceKey,
        String answerText,
        boolean reviewNeeded,
        Instant answeredAt) {
}
