package com.guseoh.csforge.review.application;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Objects;

import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/** 애플리케이션 timezone 기준 복습 시간 경계를 계산한다. */
public record ReviewTimeWindow(
        Instant startOfToday,
        Instant now,
        Instant next24Hours,
        Instant next7Days) {

    public static ReviewTimeWindow from(Instant now, ZoneId zoneId) {
        Objects.requireNonNull(now, "now is required");
        Objects.requireNonNull(zoneId, "zoneId is required");
        LocalDate today = now.atZone(zoneId).toLocalDate();
        return new ReviewTimeWindow(
                today.atStartOfDay(zoneId).toInstant(),
                now,
                now.plusSeconds(86_400),
                now.plusSeconds(604_800));
    }

    public ReviewTiming classify(ReviewScheduleStatus status, Instant dueAt) {
        if (status == ReviewScheduleStatus.MASTERED) return ReviewTiming.MASTERED;
        if (dueAt == null) return ReviewTiming.SCHEDULED;
        if (dueAt.isBefore(startOfToday)) return ReviewTiming.OVERDUE;
        if (!dueAt.isAfter(now)) return ReviewTiming.DUE_NOW;
        if (!dueAt.isAfter(next24Hours)) return ReviewTiming.NEXT_24_HOURS;
        if (!dueAt.isAfter(next7Days)) return ReviewTiming.NEXT_7_DAYS;
        return ReviewTiming.SCHEDULED;
    }
}
