package com.guseoh.csforge.quiz.application;

/**
 * 요청한 Quiz 세션이나 세션 소속 데이터를 찾을 수 없을 때 사용하는 애플리케이션 예외이다.
 */
public class QuizNotFoundException extends RuntimeException {

    public QuizNotFoundException(String message) {
        super(message);
    }
}
