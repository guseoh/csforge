package com.guseoh.csforge.ai.application;

/** 현재 분석 lifecycle에서 요청한 명령을 수행할 수 없음을 나타낸다. */
public class WrongAnswerAnalysisInvalidStateException extends RuntimeException {

    public WrongAnswerAnalysisInvalidStateException(String message) {
        super(message);
    }
}
