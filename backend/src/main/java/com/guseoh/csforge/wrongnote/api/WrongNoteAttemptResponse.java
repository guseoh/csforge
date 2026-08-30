package com.guseoh.csforge.wrongnote.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;

/**
 * 오답 시도 history의 HTTP 응답이다.
 */
public record WrongNoteAttemptResponse(long attemptId, long quizId, String source, String selectedChoiceKey, String answerText,
        AttemptGradingStatus gradingStatus, Boolean correct, boolean reviewNeeded, Instant answeredAt, Instant gradedAt, Instant updatedAt) {
}
