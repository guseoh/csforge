package com.guseoh.csforge.quiz.application.grading;

import java.util.List;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.Attempt;

/**
 * 서술형과 시나리오 문제를 사용자 자기채점 대기 상태로 전환하는 채점 전략이다.
 */
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
