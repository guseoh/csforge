package com.guseoh.csforge.learning.application;

import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;

/** Concept와 연결된 문제의 채점 상태별 전체 시도 수이다. */
public record ConceptUnderstandingCount(AttemptGradingStatus gradingStatus, long count) {
}
