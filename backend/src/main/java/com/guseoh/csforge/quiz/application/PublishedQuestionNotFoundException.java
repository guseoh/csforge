package com.guseoh.csforge.quiz.application;

/** 공개된 풀이 가능 Question이 없을 때 사용하는 애플리케이션 예외이다. */
public class PublishedQuestionNotFoundException extends RuntimeException {

    public PublishedQuestionNotFoundException() {
        super("Published question was not found");
    }
}
