package com.guseoh.csforge.quiz.domain;

/**
 * 퀴즈 세션이 문제를 선택한 학습 맥락을 표현한다.
 */
public enum QuizSessionSource {
    STANDARD,
    WRONG_RETRY,
    REVIEW
}
