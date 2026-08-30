package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;

import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;

/**
 * 문제별 오답 및 복습 현재 상태 모델이다.
 */
public record WrongNoteStateView(
        WrongNoteStatus status,
        int wrongCount,
        Instant firstWrongAt,
        Instant lastWrongAt,
        String causeNote,
        ReviewScheduleStatus reviewStatus,
        Short reviewStage,
        Instant dueAt) {
}
