package com.guseoh.csforge.quiz.application;

/**
 * 퀴즈 문항 답안 저장 유스케이스에 필요한 입력 값을 전달하는 커맨드이다.
 */
public record QuizAnswerCommand(
        String selectedChoiceKey,
        String answerText,
        boolean reviewNeeded) {
}
