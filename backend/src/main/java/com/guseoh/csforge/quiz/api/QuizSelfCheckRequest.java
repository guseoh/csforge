package com.guseoh.csforge.quiz.api;

import jakarta.validation.constraints.NotNull;

public record QuizSelfCheckRequest(@NotNull Boolean correct) {
}
