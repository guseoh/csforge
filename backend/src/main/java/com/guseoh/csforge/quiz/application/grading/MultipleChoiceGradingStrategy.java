package com.guseoh.csforge.quiz.application.grading;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.Attempt;

/**
 * 객관식 답안을 정답 선택지와 비교해 자동 채점하는 전략이다.
 */
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
                .filter(Objects::nonNull)
                .map(choice -> choice.getId())
                .findFirst()
                .orElse(null);
        boolean correct = correctChoiceId != null
                && attempt.getSelectedChoice() != null
                && correctChoiceId.equals(attempt.getSelectedChoice().getId());
        return new GradeDecision(GradeKind.AUTOMATIC, correct);
    }
}
