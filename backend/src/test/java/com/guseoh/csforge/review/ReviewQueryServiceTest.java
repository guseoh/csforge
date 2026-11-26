package com.guseoh.csforge.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.Test;

import com.guseoh.csforge.question.domain.QuestionConceptRepository;
import com.guseoh.csforge.review.application.ReviewQueryService;
import com.guseoh.csforge.review.application.ReviewSummaryView;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewSummaryCounts;
import com.guseoh.csforge.review.infrastructure.ReviewScheduleSearchRepository;

/** 복습 요약이 애플리케이션 Clock 기준의 단일 집계 쿼리와 비중복 bucket을 사용하는지 검증한다. */
class ReviewQueryServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-04T03:00:00Z");
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    @Test
    void summarySeparatesOverdueDueAndFutureWindows() {
        ReviewScheduleRepository schedules = mock(ReviewScheduleRepository.class);
        ReviewQueryService service = new ReviewQueryService(
                schedules,
                mock(ReviewScheduleSearchRepository.class),
                mock(QuestionConceptRepository.class),
                mock(com.guseoh.csforge.wrongnote.domain.WrongNoteRepository.class),
                Clock.fixed(NOW, SEOUL),
                SEOUL);
        Instant startOfToday = Instant.parse("2026-09-03T15:00:00Z");
        Instant next24 = NOW.plusSeconds(86_400);
        Instant next7 = NOW.plusSeconds(604_800);
        when(schedules.summarizeVisible(startOfToday, NOW, next24, next7))
                .thenReturn(new ReviewSummaryCounts(2L, 3L, 3L, 4L, 6L));

        ReviewSummaryView summary = service.summary();

        assertEquals(new ReviewSummaryView(2, 3, 3, 4, 6), summary);
        verify(schedules, times(1)).summarizeVisible(startOfToday, NOW, next24, next7);
    }
}
