package com.guseoh.csforge.quiz.application;

import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;

/**
 * 표준 Quiz 생성 유스케이스의 애플리케이션 명령 모델이다.
 */
public record QuizSetupRequest(
        List<String> areaSlugs,
        List<Long> conceptIds,
        List<Short> levels,
        List<QuestionDifficulty> difficulties,
        List<QuestionType> questionTypes,
        QuizQuestionState state,
        int count,
        Integer timeLimitSeconds) {

    public QuizSetupRequest {
        areaSlugs = areaSlugs == null ? List.of() : List.copyOf(areaSlugs);
        conceptIds = conceptIds == null ? List.of() : List.copyOf(conceptIds);
        levels = levels == null ? List.of() : List.copyOf(levels);
        difficulties = difficulties == null ? List.of() : List.copyOf(difficulties);
        questionTypes = questionTypes == null ? List.of() : List.copyOf(questionTypes);
        state = state == null ? QuizQuestionState.ALL : state;
        if (count < 1 || count > 50) {
            throw new IllegalArgumentException("count must be between 1 and 50");
        }
        if (timeLimitSeconds != null && (timeLimitSeconds < 1 || timeLimitSeconds > 7200)) {
            throw new IllegalArgumentException("timeLimitSeconds must be between 1 and 7200");
        }
    }

    public QuizQuestionSelectionCriteria criteria() {
        return new QuizQuestionSelectionCriteria(areaSlugs, conceptIds, levels, difficulties, questionTypes, state);
    }
}
