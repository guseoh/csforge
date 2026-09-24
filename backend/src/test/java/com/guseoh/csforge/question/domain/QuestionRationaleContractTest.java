package com.guseoh.csforge.question.domain;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.Topic;
import org.junit.jupiter.api.Test;

/** 공개 객관식 선택지 해설의 도메인 계약을 검증한다. */
class QuestionRationaleContractTest {

    @Test
    void draftAllowsIncompleteRationalesButPublicationRejectsThem() {
        for (String missingRationale : new String[]{null, "", "  "}) {
            Question question = questionWithSecondRationale(missingRationale);

            assertEquals(QuestionStatus.DRAFT, question.getStatus());
            assertThrows(IllegalStateException.class, question::publish);
            assertEquals(QuestionStatus.DRAFT, question.getStatus());
        }
    }

    @Test
    void publicationAcceptsCompleteRationales() {
        Question question = questionWithSecondRationale("The other assumption does not hold.");

        assertDoesNotThrow(question::publish);
        assertEquals(QuestionStatus.PUBLISHED, question.getStatus());
    }

    @Test
    void publishedQuestionMustReturnToDraftBeforeStructuralChange() {
        Question question = questionWithSecondRationale("The other assumption does not hold.");
        question.publish();

        assertThrows(IllegalStateException.class,
                () -> question.addChoice("C", "New choice", null, 2));
        assertEquals(QuestionStatus.PUBLISHED, question.getStatus());
        assertEquals(2, question.getChoices().size());

        question.changeToDraft();

        assertDoesNotThrow(() -> question.addChoice("C", "New choice", null, 2));
        assertEquals(QuestionStatus.DRAFT, question.getStatus());
        assertEquals(3, question.getChoices().size());
    }

    private static Question questionWithSecondRationale(String secondRationale) {
        Question question = Question.createDraft("rationale-contract", "Choose", QuestionType.MULTIPLE_CHOICE,
                QuestionDifficulty.EASY, "Explanation");
        QuestionChoice correct = question.addChoice("A", "Correct", "This follows from the contract.", 0);
        question.addChoice("B", "Incorrect", secondRationale, 1);
        question.defineCorrectChoice(correct);
        question.linkConcept(Concept.create(mock(Topic.class), "concept", "concept", "Concept", null,
                "Content", (short) 1, ContentStatus.PUBLISHED, 0));
        return question;
    }
}
