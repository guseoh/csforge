package com.guseoh.csforge.ai.domain;

/**
 * 목록 화면에 필요한 Attempt별 AI 분석 상태 projection이다.
 */
public interface WrongAnswerAnalysisStatusProjection {

    Long getAttemptId();

    WrongAnswerAnalysisStatus getStatus();
}
