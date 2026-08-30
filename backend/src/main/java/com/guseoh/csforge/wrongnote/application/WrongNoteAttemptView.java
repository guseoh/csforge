package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;

/**
 * 오답 노트의 keyset history 한 행 모델이다.
 */
public record WrongNoteAttemptView(
        long attemptId,
        long quizId,
        String source,
        String selectedChoiceKey,
        String answerText,
        AttemptGradingStatus gradingStatus,
        Boolean correct,
        boolean reviewNeeded,
        Instant answeredAt,
        Instant gradedAt,
        Instant updatedAt) {
}
