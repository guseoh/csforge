package com.guseoh.csforge.quiz.application;

import java.util.List;

public record QuestionSelectionResult(long availableCount, List<Long> questionIds) {

    public QuestionSelectionResult {
        if (availableCount < 0) {
            throw new IllegalArgumentException("availableCount must be non-negative");
        }
        questionIds = List.copyOf(questionIds);
    }
}
