package com.guseoh.csforge.review;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

import com.guseoh.csforge.review.application.ReviewTimeWindow;
import com.guseoh.csforge.review.application.ReviewTiming;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/** 애플리케이션 timezone 기준 복습 시간 경계를 검증한다. */
class ReviewTimeWindowTest {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-09-04T03:00:00Z"), SEOUL);
    private static final ReviewTimeWindow WINDOW = ReviewTimeWindow.from(Instant.now(CLOCK), SEOUL);

    @Test
    void classifiesCalendarAndFutureBoundariesWithoutOverlap() {
        assertEquals(ReviewTiming.OVERDUE, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, Instant.parse("2026-09-03T14:59:59Z")));
        assertEquals(ReviewTiming.DUE_NOW, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, WINDOW.startOfToday()));
        assertEquals(ReviewTiming.DUE_NOW, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, Instant.parse("2026-09-04T02:00:00Z")));
        assertEquals(ReviewTiming.DUE_NOW, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, WINDOW.now()));
        assertEquals(ReviewTiming.NEXT_24_HOURS, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, Instant.parse("2026-09-04T20:59:59Z")));
        assertEquals(ReviewTiming.NEXT_24_HOURS, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, WINDOW.next24Hours()));
        assertEquals(ReviewTiming.NEXT_7_DAYS, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, Instant.parse("2026-09-06T03:00:01Z")));
        assertEquals(ReviewTiming.NEXT_7_DAYS, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, WINDOW.next7Days()));
        assertEquals(ReviewTiming.SCHEDULED, WINDOW.classify(ReviewScheduleStatus.SCHEDULED, Instant.parse("2026-09-12T03:00:01Z")));
        assertEquals(ReviewTiming.MASTERED, WINDOW.classify(ReviewScheduleStatus.MASTERED, null));
    }

    @Test
    void usesTheConfiguredZoneForStartOfToday() {
        assertEquals(Instant.parse("2026-09-03T15:00:00Z"), WINDOW.startOfToday());
    }
}
