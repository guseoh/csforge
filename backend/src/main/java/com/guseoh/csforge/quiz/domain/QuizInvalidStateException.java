package com.guseoh.csforge.quiz.domain;

/**
 * 현재 Quiz 상태에서 허용되지 않는 도메인 동작을 요청할 때 사용하는 예외이다.
 */
public class QuizInvalidStateException extends RuntimeException {

    public QuizInvalidStateException(String message) {
        super(message);
    }
}
