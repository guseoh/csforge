package com.guseoh.csforge.quiz.api;

import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;

public record QuizQuestionResponse(
        long questionId,
        int position,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        List<QuizConceptResponse> concepts,
        List<QuestionChoiceResponse> choices,
        QuizSavedAnswerResponse answer) {
}
