package com.guseoh.csforge.dashboard.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.guseoh.csforge.dashboard.infrastructure.DashboardQueryRepository;
import com.guseoh.csforge.dashboard.infrastructure.DashboardWeakTopicProjection;
import com.guseoh.csforge.quiz.application.QuizQueryService;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;

/** Dashboard application view의 시간 경계와 집계 규칙을 검증한다. */
class DashboardQueryServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-03T14:30:00Z");
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final DashboardQueryRepository dashboardQueryRepository = mock(DashboardQueryRepository.class);
    private final ReviewScheduleRepository reviewScheduleRepository = mock(ReviewScheduleRepository.class);
    private final QuizSessionRepository quizSessionRepository = mock(QuizSessionRepository.class);
    private final QuizQueryService quizQueryService = mock(QuizQueryService.class);
    private final DashboardQueryService service = new DashboardQueryService(
            dashboardQueryRepository,
            reviewScheduleRepository,
            quizSessionRepository,
            quizQueryService,
            Clock.fixed(NOW, SEOUL),
            SEOUL);

    @BeforeEach
    void setUp() {
        when(dashboardQueryRepository.findConceptViews(any(Instant.class), any(Instant.class))).thenReturn(List.of());
        when(dashboardQueryRepository.findFinalizedAttempts(any(Instant.class), any(Instant.class))).thenReturn(List.of());
        when(dashboardQueryRepository.findAreaProgress()).thenReturn(List.of());
        when(dashboardQueryRepository.findWeakTopicEvidence(any(Instant.class), any(Instant.class))).thenReturn(List.of());
        when(quizSessionRepository.findTop5ByStatusInOrderByStartedAtDescIdDesc(any())).thenReturn(List.of());
        when(quizQueryService.active()).thenReturn(Optional.empty());
        when(reviewScheduleRepository.countScheduledDueBefore(any(), any(Instant.class))).thenReturn(0L);
    }

    @Test
    void usesConfiguredLocalDayAndDeduplicatesConceptViews() {
        when(dashboardQueryRepository.findConceptViews(any(Instant.class), any(Instant.class))).thenReturn(List.of(
                new com.guseoh.csforge.dashboard.infrastructure.DashboardConceptViewProjection(
                        1L, Instant.parse("2026-09-02T15:00:00Z")),
                new com.guseoh.csforge.dashboard.infrastructure.DashboardConceptViewProjection(
                        1L, Instant.parse("2026-09-03T01:00:00Z")),
                new com.guseoh.csforge.dashboard.infrastructure.DashboardConceptViewProjection(
                        2L, Instant.parse("2026-09-03T02:00:00Z")),
                new com.guseoh.csforge.dashboard.infrastructure.DashboardConceptViewProjection(
                        3L, Instant.parse("2026-09-02T14:59:59Z"))));
        when(dashboardQueryRepository.findFinalizedAttempts(any(Instant.class), any(Instant.class))).thenReturn(List.of(
                new com.guseoh.csforge.dashboard.infrastructure.DashboardAttemptActivityProjection(
                        1L, true, Instant.parse("2026-09-02T15:00:00Z")),
                new com.guseoh.csforge.dashboard.infrastructure.DashboardAttemptActivityProjection(
                        2L, false, Instant.parse("2026-09-03T14:00:00Z"))));
        when(reviewScheduleRepository.countScheduledDueBefore(any(), any(Instant.class))).thenReturn(3L);

        DashboardView dashboard = service.getDashboard();

        assertEquals(LocalDate.of(2026, 9, 3), dashboard.studyDate());
        assertEquals("Asia/Seoul", dashboard.zoneId());
        assertEquals(365, dashboard.heatmap().size());
        assertEquals(LocalDate.of(2026, 9, 3), dashboard.heatmap().get(364).date());
        assertEquals(2, dashboard.today().solvedCount());
        assertEquals(1, dashboard.today().correctCount());
        assertEquals(1, dashboard.today().wrongCount());
        assertEquals(50.0, dashboard.today().accuracyPercent());
        assertEquals(3, dashboard.today().reviewDueCount());
        assertEquals(2, dashboard.heatmap().get(364).conceptsViewed());
        assertEquals(2, dashboard.heatmap().get(364).questionsSolved());
        assertEquals(2, dashboard.currentStreak());
        assertNull(dashboard.activeQuiz());
    }

    @Test
    void deduplicatesSameAttemptWithinTopicButCountsCrossTopicEvidence() {
        when(dashboardQueryRepository.findWeakTopicEvidence(any(Instant.class), any(Instant.class))).thenReturn(List.of(
                row(10L, false, 1L, "topic-one", "Topic One", "java", "Java"),
                row(10L, false, 1L, "topic-one", "Topic One", "java", "Java"),
                row(10L, false, 2L, "topic-two", "Topic Two", "java", "Java"),
                row(11L, true, 1L, "topic-one", "Topic One", "java", "Java"),
                row(11L, true, 2L, "topic-two", "Topic Two", "java", "Java"),
                row(12L, false, 1L, "topic-one", "Topic One", "java", "Java"),
                row(12L, true, 2L, "topic-two", "Topic Two", "java", "Java")));

        List<DashboardWeakTopicView> weakTopics = service.getDashboard().weakTopics();

        assertEquals(2, weakTopics.size());
        assertEquals(1L, weakTopics.get(0).topicId());
        assertEquals(3L, weakTopics.get(0).attemptCount());
        assertEquals(1L, weakTopics.get(0).correctCount());
        assertEquals(2L, weakTopics.get(0).wrongCount());
        assertEquals(2L, weakTopics.get(1).topicId());
        assertEquals(3L, weakTopics.get(1).attemptCount());
    }

    private static DashboardWeakTopicProjection row(long attemptId, boolean correct, long topicId,
            String contentKey, String title, String areaSlug, String areaName) {
        return new DashboardWeakTopicProjection(
                attemptId, correct, topicId, contentKey, title, areaSlug, areaName);
    }
}
