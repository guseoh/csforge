package com.guseoh.csforge.quiz.application;

import java.util.List;
import java.util.Objects;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;

public record QuizQuestionSelectionCriteria(
        List<String> areaSlugs,
        List<Long> conceptIds,
        List<Short> levels,
        List<QuestionDifficulty> difficulties,
        List<QuestionType> questionTypes,
        QuizQuestionState state) {

    public QuizQuestionSelectionCriteria {
        areaSlugs = normalizeSlugs(areaSlugs);
        conceptIds = normalize(conceptIds, "conceptIds");
        levels = normalize(levels, "levels");
        difficulties = normalize(difficulties, "difficulties");
        questionTypes = normalize(questionTypes, "questionTypes");
        state = Objects.requireNonNullElse(state, QuizQuestionState.ALL);
        if (levels.stream().anyMatch(level -> level == null || level < 1 || level > 3)) {
            throw new IllegalArgumentException("levels must be between 1 and 3");
        }
    }

    private static List<String> normalizeSlugs(List<String> values) {
        List<String> normalized = values == null ? List.of() : values.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
        return List.copyOf(normalized);
    }

    private static <T> List<T> normalize(List<T> values, String name) {
        if (values == null) {
            return List.of();
        }
        if (values.stream().anyMatch(Objects::isNull)) {
            throw new IllegalArgumentException(name + " cannot contain null");
        }
        return List.copyOf(values.stream().distinct().toList());
    }
}
