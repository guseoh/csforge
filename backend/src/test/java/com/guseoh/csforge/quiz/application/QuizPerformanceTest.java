package com.guseoh.csforge.quiz.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

/** Quiz 성과의 확정 문항 분모와 정확도 계산을 검증한다. */
class QuizPerformanceTest {

    @Test
    void accuracyIncludesUnansweredAndExcludesOnlyPendingSelfChecks() {
        QuizPerformance answeredOnly = new QuizPerformance(2, 1, 1, 0, 0);
        assertEquals(2, answeredOnly.finalizedCount());
        assertEquals(0.5, answeredOnly.accuracy());

        QuizPerformance withUnanswered = new QuizPerformance(4, 1, 1, 2, 0);
        assertEquals(4, withUnanswered.finalizedCount());
        assertEquals(0.25, withUnanswered.accuracy());

        QuizPerformance withPending = new QuizPerformance(4, 1, 1, 1, 1);
        assertEquals(3, withPending.finalizedCount());
        assertEquals(1.0 / 3.0, withPending.accuracy());
        assertEquals(100.0 / 3.0, withPending.accuracyPercent(), 0.0001);
    }

    @Test
    void returnsNullWhenEveryQuestionIsWaitingForSelfCheck() {
        QuizPerformance performance = new QuizPerformance(2, 0, 0, 0, 2);

        assertEquals(0, performance.finalizedCount());
        assertNull(performance.accuracy());
        assertNull(performance.accuracyPercent());
    }

    @Test
    void allUnansweredQuestionsProduceZeroAccuracy() {
        QuizPerformance performance = new QuizPerformance(3, 0, 0, 3, 0);

        assertEquals(3, performance.finalizedCount());
        assertEquals(0.0, performance.accuracy());
    }

    @Test
    void selfCheckCompletionMovesTheQuestionIntoTheFinalizedDenominator() {
        QuizPerformance beforeSelfCheck = new QuizPerformance(2, 1, 0, 0, 1);
        QuizPerformance afterSelfCheck = new QuizPerformance(2, 1, 1, 0, 0);

        assertEquals(1.0, beforeSelfCheck.accuracy());
        assertEquals(0.5, afterSelfCheck.accuracy());
    }
}
