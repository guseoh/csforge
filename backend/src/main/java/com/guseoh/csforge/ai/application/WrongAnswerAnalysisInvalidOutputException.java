package com.guseoh.csforge.ai.application;

/** 구조 변환은 되었지만 CSForge result 계약을 통과하지 못한 provider output이다. */
public class WrongAnswerAnalysisInvalidOutputException extends RuntimeException {

    public WrongAnswerAnalysisInvalidOutputException(String message) {
        super(message);
    }
}
