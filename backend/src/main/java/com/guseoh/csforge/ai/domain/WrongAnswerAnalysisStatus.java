package com.guseoh.csforge.ai.domain;

/** 오답 분석의 영속 lifecycle 상태이다. */
public enum WrongAnswerAnalysisStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}
