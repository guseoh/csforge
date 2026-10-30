package com.guseoh.csforge.quiz.application.grading;

import java.util.List;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.quiz.domain.Attempt;

public interface QuestionGradingStrategy {

    boolean supports(Question question);

    GradeDecision grade(Question question, Attempt attempt, List<QuestionAnswer> answers);
}
