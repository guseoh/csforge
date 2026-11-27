package com.guseoh.csforge.review.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

import com.guseoh.csforge.importcontent.application.ContentImportGuard;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizSessionCreator;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.review.infrastructure.ReviewScheduleSearchRepository;

/**
 * ReviewCommandService의 기본·필터·예정 복습 퀴즈 생성 분기를 검증한다.
 */
class ReviewCommandServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-04T03:00:00Z");

    @Test
    void createQuizWithoutFiltersUsesScheduleRepositoryDueNow() {
        ReviewScheduleRepository scheduleRepository = mock(ReviewScheduleRepository.class);
        ReviewScheduleSearchRepository searchRepository = mock(ReviewScheduleSearchRepository.class);
        QuizSessionCreator sessionCreator = mock(QuizSessionCreator.class);
        ReviewCommandService service = new ReviewCommandService(
                scheduleRepository,
                searchRepository,
                mock(QuestionRepository.class),
                sessionCreator,
                Clock.fixed(NOW, ZoneOffset.UTC),
                mock(ContentImportGuard.class));

        when(sessionCreator.findExisting(any())).thenReturn(Optional.empty());
        when(scheduleRepository.findEligibleQuestionIds(ReviewScheduleStatus.SCHEDULED, NOW, PageRequest.of(0, 5)))
                .thenReturn(List.of(10L, 11L));
        QuizCreatedResult created = new QuizCreatedResult(
                99L, QuizSessionStatus.IN_PROGRESS, 2, NOW, null, 0, QuizSessionSource.REVIEW);
        when(sessionCreator.create(eq(List.of(10L, 11L)), eq(NOW), eq(null), eq(QuizSessionSource.REVIEW), any()))
                .thenReturn(created);

        QuizCreatedResult result = service.createQuiz(new ReviewQuizSetupCommand(5));

        assertEquals(99L, result.quizId());
        verify(scheduleRepository).findEligibleQuestionIds(ReviewScheduleStatus.SCHEDULED, NOW, PageRequest.of(0, 5));
    }

    @Test
    void createQuizWithFiltersOrIncludeUpcomingUsesSearchRepositoryWithCutoff() {
        ReviewScheduleRepository scheduleRepository = mock(ReviewScheduleRepository.class);
        ReviewScheduleSearchRepository searchRepository = mock(ReviewScheduleSearchRepository.class);
        QuizSessionCreator sessionCreator = mock(QuizSessionCreator.class);
        ReviewCommandService service = new ReviewCommandService(
                scheduleRepository,
                searchRepository,
                mock(QuestionRepository.class),
                sessionCreator,
                Clock.fixed(NOW, ZoneOffset.UTC),
                mock(ContentImportGuard.class));

        ReviewQuizSetupCommand command = new ReviewQuizSetupCommand(10, "spring", null, (short) 2, true);
        Instant expectedCutoff = NOW.plusSeconds(604_800L);
        when(sessionCreator.findExisting(any())).thenReturn(Optional.empty());
        when(searchRepository.findEligibleQuestionIds(command, expectedCutoff)).thenReturn(List.of(21L));
        QuizCreatedResult created = new QuizCreatedResult(
                100L, QuizSessionStatus.IN_PROGRESS, 1, NOW, null, 0, QuizSessionSource.REVIEW);
        when(sessionCreator.create(eq(List.of(21L)), eq(NOW), eq(null), eq(QuizSessionSource.REVIEW), any()))
                .thenReturn(created);

        QuizCreatedResult result = service.createQuiz(command);

        assertEquals(100L, result.quizId());
        verify(searchRepository).findEligibleQuestionIds(command, expectedCutoff);
    }

    @Test
    void createQuizThrowsWhenNoEligibleReviewsExist() {
        ReviewScheduleRepository scheduleRepository = mock(ReviewScheduleRepository.class);
        ReviewScheduleSearchRepository searchRepository = mock(ReviewScheduleSearchRepository.class);
        QuizSessionCreator sessionCreator = mock(QuizSessionCreator.class);
        ReviewCommandService service = new ReviewCommandService(
                scheduleRepository,
                searchRepository,
                mock(QuestionRepository.class),
                sessionCreator,
                Clock.fixed(NOW, ZoneOffset.UTC),
                mock(ContentImportGuard.class));

        ReviewQuizSetupCommand command = new ReviewQuizSetupCommand(10, "database", null, null, false);
        when(sessionCreator.findExisting(any())).thenReturn(Optional.empty());
        when(searchRepository.findEligibleQuestionIds(command, NOW)).thenReturn(List.of());

        assertThrows(NoDueReviewsException.class, () -> service.createQuiz(command));
    }
}
