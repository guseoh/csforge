package com.guseoh.csforge.wrongnote.api;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;

/**
 * 최신 오답 시도의 HTTP 응답이다.
 */
public record WrongNoteLatestAttemptResponse(long attemptId, Long quizId, String source, String selectedChoiceKey, String answerText,
        AttemptGradingStatus gradingStatus, Boolean correct, boolean reviewNeeded, Instant answeredAt, Instant gradedAt) {
}
