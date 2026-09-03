package com.guseoh.csforge.ai.api;

import java.util.List;

/** 검증된 AI 오답 학습 결과의 HTTP 응답 모델이다. */
public record WrongAnswerAnalysisResultResponse(
        String whyWrong,
        List<String> missedConcepts,
        String correctUnderstanding,
        List<String> relatedConceptKeys,
        List<WrongAnswerRelatedConceptResponse> relatedConcepts,
        List<String> followUpQuestions) {
}
