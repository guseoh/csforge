package com.guseoh.csforge.quiz.application;

/** 같은 생성 키를 다른 퀴즈 요청 조건에 재사용했을 때 발생하는 예외이다. */
public class QuizCreationRequestConflictException extends RuntimeException {

    public QuizCreationRequestConflictException() {
        super("Idempotency key was already used for a different quiz creation request");
    }
}
