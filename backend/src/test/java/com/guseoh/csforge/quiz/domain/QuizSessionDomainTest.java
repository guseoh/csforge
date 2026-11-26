package com.guseoh.csforge.quiz.domain;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Instant;

import org.junit.jupiter.api.Test;

/**
 * QuizSession의 ABANDONED 전이와 상태별 불변 규칙을 검증한다.
 */
class QuizSessionDomainTest {

    private static final Instant START = Instant.parse("2026-09-04T00:00:00Z");

    @Test
    void abandonTransitionsInProgressSessionAndIsIdempotent() {
        QuizSession session = QuizSession.start(START, null, QuizSessionSource.STANDARD);

        session.abandon();
        assertEquals(QuizSessionStatus.ABANDONED, session.getStatus());

        session.abandon();
        assertEquals(QuizSessionStatus.ABANDONED, session.getStatus());
    }

    @Test
    void abandonedSessionRejectsChangesResultsPositionAndSubmission() {
        QuizSession session = QuizSession.start(START, null, QuizSessionSource.STANDARD);
        session.abandon();

        assertThrows(QuizInvalidStateException.class, () -> session.ensureAcceptingChanges(START.plusSeconds(10)));
        assertThrows(QuizInvalidStateException.class, session::ensureResultAvailable);
        assertThrows(QuizInvalidStateException.class, () -> session.recordPosition(0, 3));
        assertThrows(QuizInvalidStateException.class, () -> session.submit(START.plusSeconds(10)));
    }

    @Test
    void submittedOrCompletedSessionCannotBeAbandoned() {
        QuizSession submitted = QuizSession.start(START, null, QuizSessionSource.STANDARD);
        submitted.submit(START.plusSeconds(5));
        assertThrows(QuizInvalidStateException.class, submitted::abandon);

        submitted.complete(START.plusSeconds(10));
        assertThrows(QuizInvalidStateException.class, submitted::abandon);
    }
}
