package com.guseoh.csforge.ai.api;

/** Wrong Note AI 분석 API가 노출하는 lifecycle 및 derived 상태이다. */
public enum WrongAnswerAnalysisStatusResponse {
    NOT_REQUESTED,
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    PROVIDER_NOT_CONFIGURED
}
