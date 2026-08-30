package com.guseoh.csforge.quiz.application.grading;

import java.util.List;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.Attempt;
import org.springframework.stereotype.Component;

@Component
public class MultipleChoiceGradingStrategy implements QuestionGradingStrategy {

    @Override
    public boolean supports(Question question) {
        return question.getQuestionType() == QuestionType.MULTIPLE_CHOICE;
    }

    @Override
    public GradeDecision grade(Question question, Attempt attempt, List<QuestionAnswer> answers) {
        Long correctChoiceId = answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.CORRECT_CHOICE)
                .map(QuestionAnswer::getChoice)
                .filter(java.util.Objects::nonNull)
                .map(choice -> choice.getId())
                .findFirst()
                .orElse(null);
        return new GradeDecision(GradeKind.AUTOMATIC,
                correctChoiceId != null && attempt.getSelectedChoice() != null
                        && correctChoiceId.equals(attempt.getSelectedChoice().getId()));
    }
}
