package com.guseoh.csforge.ai.application;

import java.util.List;

/** AI가 반환하고 CSForge가 별도로 검증하는 오답 학습 결과 계약이다. */
public record WrongAnswerAnalysisResult(
        String whyWrong,
        List<String> missedConcepts,
        String correctUnderstanding,
        List<String> relatedConceptKeys,
        List<String> followUpQuestions) {
}
