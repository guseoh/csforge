package com.guseoh.csforge.quiz.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/** 제출 결과에 포함된 문항별 답안, 판정, 후속 학습 상태이다. */
public record QuizQuestionResultResponse(
        long questionId,
        int position,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        List<QuizConceptResponse> concepts,
        List<QuestionChoiceReviewResponse> choices,
        String selectedChoiceKey,
        String answerText,
        boolean reviewNeeded,
        boolean wrongNoteAvailable,
        ReviewScheduleStatus reviewScheduleStatus,
        AttemptGradingStatus gradingStatus,
        Boolean correct,
        String correctChoiceKey,
        List<String> acceptedAnswers,
        String modelAnswer,
        String explanationMarkdown,
        Instant answeredAt,
        Instant gradedAt) {
}
