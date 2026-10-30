package com.guseoh.csforge.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.review.domain.ReviewTransition;
import com.guseoh.csforge.wrongnote.domain.WrongNote;

/**
 * Slice 3 오답·복습 도메인의 idempotency와 단계 전이를 검증한다.
 */
class ReviewDomainTest {

    private static final Instant BASE_TIME = Instant.parse("2026-08-30T00:00:00Z");

    @Test
    void wrongReviewResetsAnAdvancedScheduleToFirstStage() {
        Question question = question(1L);
        ReviewSchedule schedule = ReviewSchedule.start(question, null, BASE_TIME);

        ReviewTransition advanced = schedule.applyReviewOutcome(attempt(10L), true, BASE_TIME.plusSeconds(86_400));
        assertTrue(advanced.processed());
        assertEquals(2, schedule.getStage());

        Instant wrongAt = BASE_TIME.plusSeconds(172_800);
        ReviewTransition reset = schedule.applyReviewOutcome(attempt(11L), false, wrongAt);

        assertTrue(reset.processed());
        assertEquals(1, schedule.getStage());
        assertEquals(ReviewScheduleStatus.SCHEDULED, schedule.getStatus());
        assertEquals(wrongAt.plusSeconds(86_400), schedule.getDueAt());
    }

    @Test
    void wrongNoteDoesNotCountTheSamePersistedAttemptTwice() {
        Question question = question(1L);
        Attempt first = attempt(20L);
        WrongNote note = WrongNote.open(question, first, BASE_TIME);

        note.recordWrong(attempt(20L), BASE_TIME.plusSeconds(60));
        assertEquals(1, note.getWrongCount());

        note.recordWrong(attempt(21L), BASE_TIME.plusSeconds(120));
        assertEquals(2, note.getWrongCount());
    }

    private static Question question(long id) {
        Question question = mock(Question.class);
        when(question.getId()).thenReturn(id);
        return question;
    }

    private static Attempt attempt(long id) {
        Attempt attempt = mock(Attempt.class);
        when(attempt.getId()).thenReturn(id);
        return attempt;
    }
}
