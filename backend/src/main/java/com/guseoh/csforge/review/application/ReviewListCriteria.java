package com.guseoh.csforge.review.application;

import java.time.Instant;

/**
 * 복습 일정 목록의 필터 조건이다.
 */
public record ReviewListCriteria(
        ReviewDueWindow dueWindow,
        com.guseoh.csforge.review.domain.ReviewScheduleStatus status,
        String areaSlug,
        Long topicId,
        Short level,
        Instant now) {
}
