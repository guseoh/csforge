package com.guseoh.csforge.learning.application;

import java.time.Instant;

import com.guseoh.csforge.learning.domain.LearningStatus;

/** 학습 진행 상태 변경 결과를 API와 분리해 전달하는 application view이다. */
public record ConceptProgressView(
        LearningStatus status,
        boolean bookmarked,
        Instant firstViewedAt,
        Instant lastViewedAt,
        Instant completedAt) {
}
