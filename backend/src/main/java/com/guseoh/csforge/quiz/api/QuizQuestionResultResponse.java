package com.guseoh.csforge.quiz.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;

public record QuizQuestionResultResponse(
        long questionId,
        int position,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        List<QuizConceptResponse> concepts,
        String selectedChoiceKey,
        String answerText,
        boolean reviewNeeded,
        AttemptGradingStatus gradingStatus,
        Boolean correct,
        String correctChoiceKey,
        List<String> acceptedAnswers,
        String modelAnswer,
        String explanationMarkdown,
        Instant answeredAt,
        Instant gradedAt) {
}
