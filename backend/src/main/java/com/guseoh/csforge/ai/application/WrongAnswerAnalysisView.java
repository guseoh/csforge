package com.guseoh.csforge.ai.application;

import java.time.Instant;
import java.util.List;

/** Wrong Note 상세에서 현재 lastWrongAttempt에 대한 분석을 표현하는 application view이다. */
public record WrongAnswerAnalysisView(
        long questionId,
        Long attemptId,
        WrongAnswerAnalysisReadStatus status,
        boolean available,
        boolean providerConfigured,
        boolean retryable,
        WrongAnswerAnalysisResult result,
        List<RelatedConceptView> relatedConcepts,
        Instant requestedAt,
        Instant startedAt,
        Instant completedAt,
        Instant failedAt,
        String errorCode,
        String errorMessage) {

    public WrongAnswerAnalysisView {
        relatedConcepts = List.copyOf(relatedConcepts == null ? List.of() : relatedConcepts);
    }

    /** 검증된 결과가 가리키는 canonical Concept navigation view이다. */
    public record RelatedConceptView(
            long id,
            String contentKey,
            String slug,
            String title,
            String areaSlug,
            String areaName,
            short level) {
    }
}
