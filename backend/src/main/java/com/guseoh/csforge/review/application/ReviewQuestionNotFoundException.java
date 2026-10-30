package com.guseoh.csforge.review.application;

/**
 * 복습 일정에 추가하려는 Question이 존재하지 않을 때 발생한다.
 */
public class ReviewQuestionNotFoundException extends RuntimeException {

    public ReviewQuestionNotFoundException() {
        super("Question was not found");
    }
}
