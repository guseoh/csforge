package com.guseoh.csforge.quiz.application.grading;

import java.util.List;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.Attempt;
import org.springframework.stereotype.Component;

@Component
public class SelfCheckGradingStrategy implements QuestionGradingStrategy {

    @Override
    public boolean supports(Question question) {
        return question.getQuestionType() == QuestionType.DESCRIPTIVE
                || question.getQuestionType() == QuestionType.SCENARIO;
    }

    @Override
    public GradeDecision grade(Question question, Attempt attempt, List<QuestionAnswer> answers) {
        return new GradeDecision(GradeKind.SELF_CHECK, false);
    }
}
