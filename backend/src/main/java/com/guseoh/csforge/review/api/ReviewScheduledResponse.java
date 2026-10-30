package com.guseoh.csforge.review.api;

import java.time.Instant;

import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 명시적으로 예약한 복습 일정의 HTTP 응답이다.
 */
public record ReviewScheduledResponse(long questionId, ReviewScheduleStatus status, short stage, Instant dueAt) {
}
