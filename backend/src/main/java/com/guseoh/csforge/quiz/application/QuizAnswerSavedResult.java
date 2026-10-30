package com.guseoh.csforge.quiz.application;

import java.time.Instant;

/**
 * 저장된 퀴즈 답안의 현재 상태를 전달하는 애플리케이션 결과 모델이다.
 */
public record QuizAnswerSavedResult(
        long questionId,
        String selectedChoiceKey,
        String answerText,
        boolean reviewNeeded,
        Instant answeredAt) {
}
