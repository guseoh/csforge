package com.guseoh.csforge.review.application;

import java.time.Instant;
import java.util.Objects;

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

    public ReviewListCriteria(
            ReviewDueWindow dueWindow,
            com.guseoh.csforge.review.domain.ReviewScheduleStatus status,
            String areaSlug,
            Long topicId,
            Short level) {
        this(dueWindow, status, areaSlug, topicId, level, null);
    }

    public ReviewListCriteria at(Instant now) {
        return new ReviewListCriteria(
                dueWindow,
                status,
                areaSlug,
                topicId,
                level,
                Objects.requireNonNull(now, "now is required"));
    }
}
