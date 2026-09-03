package com.guseoh.csforge.ai.application;

/** 현재 Wrong Note의 Attempt가 AI 분석 대상 조건을 만족하지 않음을 나타낸다. */
public class WrongAnswerAnalysisEligibilityException extends RuntimeException {

    public WrongAnswerAnalysisEligibilityException(String message) {
        super(message);
    }
}
