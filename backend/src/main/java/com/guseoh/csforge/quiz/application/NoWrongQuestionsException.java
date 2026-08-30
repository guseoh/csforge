package com.guseoh.csforge.quiz.application;

public class NoWrongQuestionsException extends RuntimeException {

    public NoWrongQuestionsException() {
        super("There are no finalized wrong questions to retry");
    }
}
