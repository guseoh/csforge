package com.guseoh.csforge.quiz.api;

import jakarta.validation.constraints.NotNull;

public record QuizAnswerSaveRequest(
        String selectedChoiceKey,
        String answerText,
        @NotNull Boolean reviewNeeded) {
}
