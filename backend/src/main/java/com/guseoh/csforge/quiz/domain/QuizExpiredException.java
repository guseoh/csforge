package com.guseoh.csforge.quiz.domain;

public class QuizExpiredException extends RuntimeException {

    public QuizExpiredException(String message) {
        super(message);
    }
}
