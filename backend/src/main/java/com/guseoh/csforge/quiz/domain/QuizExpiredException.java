package com.guseoh.csforge.quiz.domain;

/**
 * 만료된 Quiz에서 더 이상 허용되지 않는 상태 변경을 요청할 때 사용하는 도메인 예외이다.
 */
public class QuizExpiredException extends RuntimeException {

    public QuizExpiredException(String message) {
        super(message);
    }
}
