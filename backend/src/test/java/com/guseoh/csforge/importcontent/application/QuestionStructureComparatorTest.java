package com.guseoh.csforge.importcontent.application;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import org.junit.jupiter.api.Test;

/** Import preview와 apply가 동일한 Question 구조 비교 결과를 사용하는지 고정한다. */
class QuestionStructureComparatorTest {

    @Test
    void matchesEquivalentQuestionStructure() {
        Question question = question();

        assertTrue(QuestionStructureComparator.matches(item("B"), question));
    }

    @Test
    void detectsStructuralDifferences() {
        Question question = question();

        assertFalse(QuestionStructureComparator.matches(item("A"), question));
    }

    private static Question question() {
        Question question = Question.createDraft(
                "q-1",
                "Prompt",
                QuestionType.MULTIPLE_CHOICE,
                QuestionDifficulty.EASY,
                "Explanation");
        question.replaceStructure(
                QuestionType.MULTIPLE_CHOICE,
                List.of(
                        new Question.ChoiceDraft("A", "First", 0),
                        new Question.ChoiceDraft("B", "Second", 1)),
                "B",
                List.of(),
                null,
                List.of());
        return question;
    }

    private static NormalizedImportItem item(String correctChoiceKey) {
        return new NormalizedImportItem(
                "question.json",
                0,
                ImportItemKind.QUESTION,
                "q-1",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                (short) 0,
                "PUBLISHED",
                0,
                true,
                List.of(),
                false,
                "Prompt",
                "MULTIPLE_CHOICE",
                "EASY",
                "Explanation",
                List.of(),
                List.of(
                        new NormalizedChoice("A", "First", 0),
                        new NormalizedChoice("B", "Second", 1)),
                correctChoiceKey,
                List.of(),
                null,
                List.of(),
                null);
    }
}
