package com.guseoh.csforge.outcome.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.review.domain.ReviewHistoryRepository;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/** FinalizedAttemptOutcomeCoordinator의 일괄 조회(N+1 방지)와 미답변 reviewNeeded 복습 반영을 검증한다. */
class FinalizedAttemptOutcomeCoordinatorTest {

    private static final Instant NOW = Instant.parse("2026-11-26T12:00:00Z");

    @Test
    void processAllBatchLoadsAndSchedulesUnansweredReviewNeededWithoutWrongNote() {
        WrongNoteRepository wrongNoteRepository = mock(WrongNoteRepository.class);
        ReviewScheduleRepository reviewScheduleRepository = mock(ReviewScheduleRepository.class);
        ReviewHistoryRepository reviewHistoryRepository = mock(ReviewHistoryRepository.class);
        when(wrongNoteRepository.findByQuestionIdIn(anyList())).thenReturn(List.of());
        when(reviewScheduleRepository.findByQuestionIdIn(anyList())).thenReturn(List.of());
        when(wrongNoteRepository.save(any(WrongNote.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewScheduleRepository.save(any(ReviewSchedule.class))).thenAnswer(inv -> inv.getArgument(0));

        var coordinator = new FinalizedAttemptOutcomeCoordinator(
                wrongNoteRepository,
                reviewScheduleRepository,
                reviewHistoryRepository,
                Clock.fixed(NOW, ZoneOffset.UTC));

        Attempt answeredWrong = attempt(1L, 101L, QuizSessionSource.STANDARD, true, false, false);
        Attempt unansweredReviewNeeded = attempt(2L, 102L, QuizSessionSource.STANDARD, false, false, true);
        Attempt unansweredPlain = attempt(3L, 103L, QuizSessionSource.STANDARD, false, false, false);

        coordinator.processAll(List.of(answeredWrong, unansweredReviewNeeded, unansweredPlain));

        // Batch-loaded once instead of N+1 per-attempt findByQuestionId calls
        verify(wrongNoteRepository, times(1)).findByQuestionIdIn(List.of(101L, 102L));
        verify(reviewScheduleRepository, times(1)).findByQuestionIdIn(List.of(101L, 102L));
        verify(wrongNoteRepository, never()).findByQuestionId(any(Long.class));
        verify(reviewScheduleRepository, never()).findByQuestionId(any(Long.class));

        // Only answeredWrong creates a WrongNote; both 101 and 102 create ReviewSchedules
        verify(wrongNoteRepository, times(1)).save(any(WrongNote.class));
        ArgumentCaptor<ReviewSchedule> savedSchedules = ArgumentCaptor.forClass(ReviewSchedule.class);
        verify(reviewScheduleRepository, times(2)).save(savedSchedules.capture());
        assertEquals(List.of(101L, 102L),
                savedSchedules.getAllValues().stream().map(ReviewSchedule::getQuestionId).toList());
        savedSchedules.getAllValues().forEach(schedule -> {
            assertEquals(ReviewScheduleStatus.SCHEDULED, schedule.getStatus());
            assertEquals((short) 1, schedule.getStage());
        });

        verify(answeredWrong).markOutcomeProcessed(NOW);
        verify(unansweredReviewNeeded).markOutcomeProcessed(NOW);
        verify(unansweredPlain).markOutcomeProcessed(NOW);
    }

    private static Attempt attempt(
            long attemptId,
            long questionId,
            QuizSessionSource source,
            boolean hasAnswer,
            boolean correct,
            boolean reviewNeeded) {
        Question question = mock(Question.class);
        when(question.getId()).thenReturn(questionId);
        QuizSession session = mock(QuizSession.class);
        when(session.getSource()).thenReturn(source);
        Attempt attempt = mock(Attempt.class);
        when(attempt.getId()).thenReturn(attemptId);
        when(attempt.getQuestion()).thenReturn(question);
        when(attempt.getQuizSession()).thenReturn(session);
        when(attempt.isFinalized()).thenReturn(true);
        when(attempt.isOutcomeProcessed()).thenReturn(false);
        when(attempt.hasAnswer()).thenReturn(hasAnswer);
        when(attempt.getCorrect()).thenReturn(correct);
        when(attempt.isReviewNeeded()).thenReturn(reviewNeeded);
        when(attempt.getGradedAt()).thenReturn(NOW);
        return attempt;
    }
}
