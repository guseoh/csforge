package com.guseoh.csforge.wrongnote.api;

import java.time.Instant;

import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;

/**
 * 오답 및 복습 현재 상태의 HTTP 응답이다.
 */
public record WrongNoteStateResponse(WrongNoteStatus status, int wrongCount, Instant firstWrongAt, Instant lastWrongAt,
        String causeNote, ReviewScheduleStatus reviewStatus, Short reviewStage, Instant dueAt) {
}
