package com.guseoh.csforge.quiz.application;

/**
 * 퀴즈 세션 화면에 필요한 데이터와 만료 상태를 전달하는 조회 모델이다.
 */
public record QuizSessionView(QuizSessionData data, boolean expired) {
}
