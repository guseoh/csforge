package com.guseoh.csforge.question.domain;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.Topic;
import org.junit.jupiter.api.Test;

/** 공개 단답형의 설명 필수 조건과 DRAFT의 불완전 상태를 검증한다. */
class QuestionShortAnswerExplanationContractTest {

    @Test
    void draftMayOmitExplanationButCannotBePublishedWithoutOne() {
        for (String explanation : new String[]{null, "", "  "}) {
            Question question = shortAnswerQuestion(explanation);

            assertEquals(QuestionStatus.DRAFT, question.getStatus());
            assertThrows(IllegalStateException.class, question::publish);
            assertEquals(QuestionStatus.DRAFT, question.getStatus());
        }
    }

    @Test
    void publishedShortAnswerAcceptsNonBlankExplanation() {
        Question question = shortAnswerQuestion("Reasoning and boundary.");

        assertDoesNotThrow(question::publish);
        assertEquals(QuestionStatus.PUBLISHED, question.getStatus());
    }

    @Test
    void publishedShortAnswerRejectsIncompleteMetadataRevisionWithoutMutatingState() {
        Question question = shortAnswerQuestion("Reasoning and boundary.");
        question.publish();

        assertThrows(IllegalStateException.class,
                () -> question.reviseMetadata("Changed prompt", QuestionDifficulty.MEDIUM, null));

        assertEquals(QuestionStatus.PUBLISHED, question.getStatus());
        assertEquals("Prompt", question.getPromptMarkdown());
        assertEquals(QuestionDifficulty.EASY, question.getDifficulty());
        assertEquals("Reasoning and boundary.", question.getExplanationMarkdown());
    }

    @Test
    void draftShortAnswerMayReviseMetadataWithoutExplanation() {
        Question question = shortAnswerQuestion("Reasoning and boundary.");

        assertDoesNotThrow(() ->
                question.reviseMetadata("Changed prompt", QuestionDifficulty.MEDIUM, null));

        assertEquals(QuestionStatus.DRAFT, question.getStatus());
        assertEquals("Changed prompt", question.getPromptMarkdown());
        assertEquals(QuestionDifficulty.MEDIUM, question.getDifficulty());
        assertEquals(null, question.getExplanationMarkdown());
    }

    private static Question shortAnswerQuestion(String explanation) {
        Question question = Question.createDraft("short-answer-explanation", "Prompt", QuestionType.SHORT_ANSWER,
                QuestionDifficulty.EASY, explanation);
        question.addAcceptedAnswer("answer");
        question.linkConcept(Concept.create(mock(Topic.class), "concept", "concept", "Concept", null,
                "Content", (short) 1, ContentStatus.PUBLISHED, 0));
        return question;
    }
}
