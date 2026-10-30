package com.guseoh.csforge.ai.application;

/** 오답 분석 요청의 idempotency 결과이다. */
public record WrongAnswerAnalysisRequestResult(long attemptId, boolean created) {
}
