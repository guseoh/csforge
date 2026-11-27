package com.guseoh.csforge.quiz.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionAttemptSummary;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;

/**
 * QuizQueryService의 퀴즈 이력 조회와 배치 집계 동작을 검증한다.
 */
class QuizQueryServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-04T03:00:00Z");

    @Test
    void historyBatchesAttemptSummariesAndCalculatesAccuracy() {
        QuizSessionRepository sessionRepository = mock(QuizSessionRepository.class);
        AttemptRepository attemptRepository = mock(AttemptRepository.class);
        QuizQueryService service = new QuizQueryService(
                sessionRepository,
                mock(QuizQuestionRepository.class),
                attemptRepository,
                mock(QuizSessionDataLoader.class),
                mock(QuizResultCalculator.class),
                mock(WrongNoteRepository.class),
                mock(ReviewScheduleRepository.class),
                Clock.fixed(NOW, ZoneOffset.UTC));

        QuizSession session = mock(QuizSession.class);
        when(session.getId()).thenReturn(42L);
        when(session.getStatus()).thenReturn(QuizSessionStatus.COMPLETED);
        when(session.getSource()).thenReturn(QuizSessionSource.REVIEW);
        when(session.getStartedAt()).thenReturn(NOW.minusSeconds(300));
        when(session.getSubmittedAt()).thenReturn(NOW.minusSeconds(60));
        when(session.getCompletedAt()).thenReturn(NOW.minusSeconds(60));

        when(sessionRepository.findByStatusInAndSourceOrderByStartedAtDescIdDesc(
                eq(List.of(QuizSessionStatus.SUBMITTED, QuizSessionStatus.COMPLETED)),
                eq(QuizSessionSource.REVIEW),
                eq(PageRequest.of(0, 10))))
                .thenReturn(new PageImpl<>(List.of(session), PageRequest.of(0, 10), 1));
        when(attemptRepository.summarizeByQuizSessionIds(List.of(42L)))
                .thenReturn(List.of(new QuizSessionAttemptSummary(42L, 4L, 3L, 1L, 0L, 0L)));

        QuizHistoryPageView result = service.history(QuizSessionSource.REVIEW, 0, 10);

        assertEquals(1, result.items().size());
        QuizHistoryItemView item = result.items().getFirst();
        assertEquals(42L, item.quizId());
        assertEquals(4, item.total());
        assertEquals(3, item.correct());
        assertEquals(1, item.wrong());
        assertEquals(0.75, item.accuracy());
        verify(attemptRepository).summarizeByQuizSessionIds(List.of(42L));
    }

    @Test
    void historyQueriesAllSourcesWhenSourceIsNull() {
        QuizSessionRepository sessionRepository = mock(QuizSessionRepository.class);
        AttemptRepository attemptRepository = mock(AttemptRepository.class);
        QuizQueryService service = new QuizQueryService(
                sessionRepository,
                mock(QuizQuestionRepository.class),
                attemptRepository,
                mock(QuizSessionDataLoader.class),
                mock(QuizResultCalculator.class),
                mock(WrongNoteRepository.class),
                mock(ReviewScheduleRepository.class),
                Clock.fixed(NOW, ZoneOffset.UTC));

        when(sessionRepository.findByStatusInOrderByStartedAtDescIdDesc(any(), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        QuizHistoryPageView result = service.history(null, 0, 20);

        assertEquals(0, result.items().size());
        assertEquals(0L, result.totalElements());
    }
}
