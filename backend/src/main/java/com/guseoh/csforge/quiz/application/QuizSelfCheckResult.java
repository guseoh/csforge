package com.guseoh.csforge.quiz.application;

import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * 서술형 문항의 자기채점 결과를 전달하는 애플리케이션 결과 모델이다.
 */
public record QuizSelfCheckResult(
        long quizId,
        long questionId,
        boolean correct,
        QuizSessionStatus sessionStatus) {
}
