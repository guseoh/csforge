package com.guseoh.csforge.quiz.application.grading;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.Attempt;

/**
 * 단답형 답안을 trim과 대소문자 정규화 후 허용 답안과 비교해 자동 채점하는 전략이다.
 */
@Component
public class ShortAnswerGradingStrategy implements QuestionGradingStrategy {

    @Override
    public boolean supports(Question question) {
        return question.getQuestionType() == QuestionType.SHORT_ANSWER;
    }

    @Override
    public GradeDecision grade(Question question, Attempt attempt, List<QuestionAnswer> answers) {
        String submitted = normalize(attempt.getAnswerText());
        boolean correct = submitted != null && answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.ACCEPTED_TEXT)
                .map(QuestionAnswer::getAnswerText)
                .map(this::normalize)
                .anyMatch(submitted::equals);
        return new GradeDecision(GradeKind.AUTOMATIC, correct);
    }

    private String normalize(String answer) {
        return answer == null || answer.isBlank() ? null : answer.trim().toLowerCase(Locale.ROOT);
    }
}
