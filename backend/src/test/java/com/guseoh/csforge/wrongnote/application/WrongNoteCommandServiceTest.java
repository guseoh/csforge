package com.guseoh.csforge.wrongnote.application;

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
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.quiz.application.NoWrongQuestionsException;
import com.guseoh.csforge.quiz.application.QuizCreatedResult;
import com.guseoh.csforge.quiz.application.QuizSessionCreator;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import com.guseoh.csforge.wrongnote.domain.WrongNoteStatus;
import com.guseoh.csforge.wrongnote.infrastructure.WrongNoteSearchRepository;

/**
 * WrongNoteCommandService의 필터된 오답 묶음 재풀이 유스케이스를 검증한다.
 */
class WrongNoteCommandServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-04T03:00:00Z");

    @Test
    void retryFilteredBuildsWrongRetryQuizFromMatchingNotes() {
        WrongNoteRepository noteRepository = mock(WrongNoteRepository.class);
        WrongNoteSearchRepository searchRepository = mock(WrongNoteSearchRepository.class);
        QuizSessionCreator sessionCreator = mock(QuizSessionCreator.class);
        WrongNoteCommandService service = new WrongNoteCommandService(
                noteRepository, searchRepository, sessionCreator, Clock.fixed(NOW, ZoneOffset.UTC));

        Question q1 = mock(Question.class);
        when(q1.getId()).thenReturn(101L);
        Question q2 = mock(Question.class);
        when(q2.getId()).thenReturn(102L);
        WrongNote n1 = mock(WrongNote.class);
        when(n1.getQuestion()).thenReturn(q1);
        WrongNote n2 = mock(WrongNote.class);
        when(n2.getQuestion()).thenReturn(q2);

        when(sessionCreator.findExisting(any())).thenReturn(Optional.empty());
        when(searchRepository.search(any(), eq(PageRequest.of(0, 10))))
                .thenReturn(new PageImpl<>(List.of(n1, n2), PageRequest.of(0, 10), 2));
        QuizCreatedResult created = new QuizCreatedResult(
                77L, QuizSessionStatus.IN_PROGRESS, 2, NOW, null, 0, QuizSessionSource.WRONG_RETRY);
        when(sessionCreator.create(eq(List.of(101L, 102L)), eq(NOW), eq(null), eq(QuizSessionSource.WRONG_RETRY), any()))
                .thenReturn(created);

        WrongNoteBulkRetryCommand command = new WrongNoteBulkRetryCommand(
                "database", null, (short) 2, QuestionDifficulty.HARD, null, 10);
        QuizCreatedResult result = service.retryFiltered(command, UUID.randomUUID());

        assertEquals(77L, result.quizId());
        ArgumentCaptor<WrongNoteListCriteria> captor = ArgumentCaptor.forClass(WrongNoteListCriteria.class);
        verify(searchRepository).search(captor.capture(), eq(PageRequest.of(0, 10)));
        assertEquals("database", captor.getValue().areaSlug());
        assertEquals(WrongNoteStatus.ACTIVE, captor.getValue().status());
        assertEquals(QuestionDifficulty.HARD, captor.getValue().difficulty());
    }

    @Test
    void retryFilteredThrowsWhenNoWrongNotesMatch() {
        WrongNoteSearchRepository searchRepository = mock(WrongNoteSearchRepository.class);
        QuizSessionCreator sessionCreator = mock(QuizSessionCreator.class);
        WrongNoteCommandService service = new WrongNoteCommandService(
                mock(WrongNoteRepository.class), searchRepository, sessionCreator, Clock.fixed(NOW, ZoneOffset.UTC));

        when(sessionCreator.findExisting(any())).thenReturn(Optional.empty());
        when(searchRepository.search(any(), eq(PageRequest.of(0, 5))))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 5), 0));

        assertThrows(
                NoWrongQuestionsException.class,
                () -> service.retryFiltered(new WrongNoteBulkRetryCommand(null, null, null, null, null, 5), null));
    }
}
