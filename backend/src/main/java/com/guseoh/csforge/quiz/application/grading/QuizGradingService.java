package com.guseoh.csforge.quiz.application.grading;

import java.time.Instant;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizInvalidStateException;

/**
 * 문제 유형에 맞는 채점 전략을 선택하고 Attempt에 채점 결과를 적용하는 서비스이다.
 */
@Service
@RequiredArgsConstructor
public class QuizGradingService {

    private final List<QuestionGradingStrategy> strategies;

    public void grade(Question question, Attempt attempt, List<QuestionAnswer> answers, Instant now) {
        if (!attempt.hasAnswer()) {
            attempt.gradeAutomatically(false, now);
            return;
        }
        QuestionGradingStrategy strategy = strategies.stream()
                .filter(candidate -> candidate.supports(question))
                .findFirst()
                .orElseThrow(() -> new QuizInvalidStateException("No grading strategy for question type"));
        GradeDecision decision = strategy.grade(question, attempt, answers);
        if (decision.kind() == GradeKind.SELF_CHECK) {
            attempt.requireSelfCheck(now);
            return;
        }
        attempt.gradeAutomatically(decision.correct(), now);
    }
}
