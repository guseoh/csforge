package com.guseoh.csforge.ai.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import com.guseoh.csforge.question.domain.QuestionType;
import org.junit.jupiter.api.Test;

/** AI structured result의 application validation 계약을 검증한다. */
class WrongAnswerAnalysisResultValidatorTest {

    private final WrongAnswerAnalysisResultValidator validator = new WrongAnswerAnalysisResultValidator();
    private final WrongAnswerAnalysisInputSnapshot snapshot = new WrongAnswerAnalysisInputSnapshot(
            new WrongAnswerAnalysisInputSnapshot.QuestionSnapshot(
                    "question-1", QuestionType.MULTIPLE_CHOICE, "Which?", "Because."),
            List.of(new WrongAnswerAnalysisInputSnapshot.ChoiceSnapshot("A", "First")),
            new WrongAnswerAnalysisInputSnapshot.UserAnswerSnapshot("A", null),
            new WrongAnswerAnalysisInputSnapshot.CanonicalAnswerSnapshot("B", List.of(), null),
            List.of(new WrongAnswerAnalysisInputSnapshot.ConceptSnapshot("concept-1", "Transactions", "Atomic work")));

    @Test
    void validatesAndTrimsTypedResult() {
        WrongAnswerAnalysisResult result = validator.validate(
                new WrongAnswerAnalysisResult(
                        " why ", List.of(" transaction "), " correct ", List.of("concept-1"), List.of(" check ")),
                snapshot);

        assertEquals("why", result.whyWrong());
        assertEquals(List.of("transaction"), result.missedConcepts());
        assertEquals(List.of("concept-1"), result.relatedConceptKeys());
    }

    @Test
    void rejectsBlankMembersAndHallucinatedConceptKeys() {
        assertThrows(WrongAnswerAnalysisInvalidOutputException.class, () -> validator.validate(
                new WrongAnswerAnalysisResult("why", List.of(" "), "correct", List.of(), List.of("follow-up")),
                snapshot));
        assertThrows(WrongAnswerAnalysisInvalidOutputException.class, () -> validator.validate(
                new WrongAnswerAnalysisResult("why", List.of("missed"), "correct", List.of("not-in-snapshot"), List.of("follow-up")),
                snapshot));
    }

    @Test
    void rejectsUnboundedCollections() {
        assertThrows(WrongAnswerAnalysisInvalidOutputException.class, () -> validator.validate(
                new WrongAnswerAnalysisResult(
                        "why", List.of("one", "two", "three", "four"), "correct", List.of(), List.of("follow-up")),
                snapshot));
    }
}
