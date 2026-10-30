package com.guseoh.csforge.learning.application;

import java.time.Instant;
import com.guseoh.csforge.learning.domain.LearningStatus;

/** 학습 완료 여부와 별도로 계산한 문제 풀이 근거의 읽기 전용 요약이다. */
public record ConceptUnderstandingView(
        long conceptId,
        LearningStatus learningStatus,
        Evidence evidence,
        Double recentAccuracyPercent,
        ConceptAssessmentStatus assessmentStatus,
        Instant lastAssessedAt) {

    public record Evidence(
            int uniqueQuestions,
            long finalizedAttempts,
            int correctQuestions,
            long pendingSelfCheckCount) {
    }
}
