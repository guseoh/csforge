package com.guseoh.csforge.review.application;

import java.time.Instant;

import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 명시적으로 생성하거나 갱신한 복습 일정 결과이다.
 */
public record ReviewScheduledView(long questionId, ReviewScheduleStatus status, short stage, Instant dueAt) {
}
