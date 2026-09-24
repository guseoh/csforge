package com.guseoh.csforge.quiz.application;

/** 연습 대상 Concept이 source 문제와 연결되어 있지 않거나 현재 공개 상태가 아닐 때 사용하는 예외이다. */
public class RelatedConceptUnavailableException extends RuntimeException {

    public RelatedConceptUnavailableException() {
        super("The selected concept is not an available concept linked to this question");
    }
}
