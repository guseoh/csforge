package com.guseoh.csforge.quiz.domain;

/**
 * Quiz 문항 유형이나 상태에 맞지 않는 답안 변경을 거부할 때 사용하는 도메인 예외이다.
 */
public class QuizAnswerException extends RuntimeException {

    public QuizAnswerException(String message) {
        super(message);
    }
}
