package com.guseoh.csforge.quiz.application;

import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/** 한 문항의 실제 오답 노트와 복습 일정 상태를 전달한다. */
public record QuizQuestionOutcomeView(
        long questionId,
        boolean wrongNoteAvailable,
        ReviewScheduleStatus reviewScheduleStatus) {
}
