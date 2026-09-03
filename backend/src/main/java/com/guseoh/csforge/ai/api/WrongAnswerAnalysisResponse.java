package com.guseoh.csforge.ai.api;

import java.time.Instant;

/** Wrong Note 상세의 현재 AI 오답 분석 상태와 결과를 표현하는 응답이다. */
public record WrongAnswerAnalysisResponse(
        long questionId,
        Long attemptId,
        WrongAnswerAnalysisStatusResponse status,
        boolean available,
        boolean providerConfigured,
        boolean retryable,
        WrongAnswerAnalysisResultResponse result,
        Instant requestedAt,
        Instant startedAt,
        Instant completedAt,
        Instant failedAt,
        String errorCode,
        String errorMessage) {
}
