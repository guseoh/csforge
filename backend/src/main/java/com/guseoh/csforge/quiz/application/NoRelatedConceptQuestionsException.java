package com.guseoh.csforge.quiz.application;

/** 선택한 Concept에서 source 문제를 제외하고 연습할 공개 문항이 없을 때 사용하는 예외이다. */
public class NoRelatedConceptQuestionsException extends RuntimeException {

    public NoRelatedConceptQuestionsException() {
        super("No other published questions are available for this concept");
    }
}
