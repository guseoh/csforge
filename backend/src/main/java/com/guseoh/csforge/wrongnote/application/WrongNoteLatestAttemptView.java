package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;

import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;

/**
 * 상세 화면에 표시할 최신 오답 시도의 모델이다.
 */
public record WrongNoteLatestAttemptView(
        long attemptId,
        Long quizId,
        String source,
        String selectedChoiceKey,
        String answerText,
        AttemptGradingStatus gradingStatus,
        Boolean correct,
        boolean reviewNeeded,
        Instant answeredAt,
        Instant gradedAt) {
}
