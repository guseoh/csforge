package com.guseoh.csforge.quiz.api;

import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.application.QuizQuestionState;
import com.guseoh.csforge.quiz.application.QuizSetupRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record QuizCreateRequest(
        List<String> areas,
        List<Long> concepts,
        List<Short> levels,
        List<QuestionDifficulty> difficulties,
        List<QuestionType> questionTypes,
        QuizQuestionState state,
        @Min(1) @Max(50) Integer count,
        @Min(1) @Max(7200) Integer timeLimitSeconds) {

    public QuizCreateRequest {
        areas = areas == null ? List.of() : List.copyOf(areas);
        concepts = concepts == null ? List.of() : List.copyOf(concepts);
        levels = levels == null ? List.of() : List.copyOf(levels);
        difficulties = difficulties == null ? List.of() : List.copyOf(difficulties);
        questionTypes = questionTypes == null ? List.of() : List.copyOf(questionTypes);
        state = state == null ? QuizQuestionState.ALL : state;
        count = count == null ? 10 : count;
    }

    public QuizSetupRequest toSetupRequest() {
        return new QuizSetupRequest(areas, concepts, levels, difficulties, questionTypes, state, count, timeLimitSeconds);
    }
}
