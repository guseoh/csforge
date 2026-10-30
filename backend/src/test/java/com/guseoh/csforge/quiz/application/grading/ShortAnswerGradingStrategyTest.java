package com.guseoh.csforge.quiz.application.grading;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.Attempt;
import java.util.List;
import org.junit.jupiter.api.Test;

/** 단답형 채점의 trim 및 대소문자 무시 exact-match 계약을 검증한다. */
class ShortAnswerGradingStrategyTest {

    private final ShortAnswerGradingStrategy gradingStrategy = new ShortAnswerGradingStrategy();

    @Test
    void trimsAndIgnoresCaseButStillRequiresAnExactMatch() {
        Question question = Question.createDraft("grading-contract", "Prompt", QuestionType.SHORT_ANSWER,
                QuestionDifficulty.EASY, "Explanation");
        question.addAcceptedAnswer("Exact answer");

        assertTrue(grade(question, "  EXACT ANSWER  "));
        assertFalse(grade(question, "Exact"));
        assertFalse(grade(question, "Exact answer with extra text"));
    }

    private boolean grade(Question question, String answer) {
        Attempt attempt = mock(Attempt.class);
        when(attempt.getAnswerText()).thenReturn(answer);
        return gradingStrategy.grade(question, attempt, List.copyOf(question.getAnswers())).correct();
    }
}
