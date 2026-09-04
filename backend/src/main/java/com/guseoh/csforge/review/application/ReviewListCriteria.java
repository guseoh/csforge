package com.guseoh.csforge.review.application;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
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
        Instant now,
        Instant startOfToday) {

    public ReviewListCriteria(
            ReviewDueWindow dueWindow,
            com.guseoh.csforge.review.domain.ReviewScheduleStatus status,
            String areaSlug,
            Long topicId,
            Short level) {
        this(dueWindow, status, areaSlug, topicId, level, null, null);
    }

    public ReviewListCriteria(
            ReviewDueWindow dueWindow,
            com.guseoh.csforge.review.domain.ReviewScheduleStatus status,
            String areaSlug,
            Long topicId,
            Short level,
            Instant now) {
        this(dueWindow, status, areaSlug, topicId, level, now, null);
    }

    public ReviewListCriteria at(Instant now) {
        return at(ReviewTimeWindow.from(now, ZoneOffset.UTC));
    }

    public ReviewListCriteria at(Instant now, ZoneId zoneId) {
        return at(ReviewTimeWindow.from(now, zoneId));
    }

    public ReviewListCriteria at(ReviewTimeWindow timeWindow) {
        return new ReviewListCriteria(
                dueWindow,
                status,
                areaSlug,
                topicId,
                level,
                Objects.requireNonNull(timeWindow, "timeWindow is required").now(),
                timeWindow.startOfToday());
    }
}
