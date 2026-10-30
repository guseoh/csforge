package com.guseoh.csforge.learning.application;

import java.time.Instant;

/** 서로 다른 문제의 최신 확정 채점 결과 한 건이다. */
public record ConceptUnderstandingEvidence(Long questionId, Boolean correct, Instant gradedAt, Long attemptId) {
}
