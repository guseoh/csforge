package com.guseoh.csforge.quiz.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuizPositionUpdateRequest(@NotNull @Min(0) Integer position) {
}
