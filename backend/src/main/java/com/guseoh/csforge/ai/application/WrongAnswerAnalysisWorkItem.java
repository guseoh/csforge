package com.guseoh.csforge.ai.application;

/** DB claim 이후 transaction 밖에서 provider에 전달할 durable analysis 작업 snapshot이다. */
public record WrongAnswerAnalysisWorkItem(long analysisId, long attemptId, String processingToken, String inputSnapshot) {
}
