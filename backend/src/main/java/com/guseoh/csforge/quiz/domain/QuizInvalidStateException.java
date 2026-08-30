package com.guseoh.csforge.quiz.domain;

public class QuizInvalidStateException extends RuntimeException {

    public QuizInvalidStateException(String message) {
        super(message);
    }
}
