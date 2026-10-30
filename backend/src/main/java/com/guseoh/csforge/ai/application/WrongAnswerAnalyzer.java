package com.guseoh.csforge.ai.application;

/** AI provider를 application에서 격리하는 오답 분석 port이다. */
public interface WrongAnswerAnalyzer {

    WrongAnswerAnalysisResult analyze(WrongAnswerAnalysisInputSnapshot snapshot);

    default boolean isConfigured() {
        return true;
    }
}
