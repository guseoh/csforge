package com.guseoh.csforge.ai.application;

/** 영속 lifecycle과 provider 설정을 합쳐 API에 제공하는 읽기 상태이다. */
public enum WrongAnswerAnalysisReadStatus {
    NOT_REQUESTED,
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED,
    PROVIDER_NOT_CONFIGURED
}
