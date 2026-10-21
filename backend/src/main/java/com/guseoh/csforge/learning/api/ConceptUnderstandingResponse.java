package com.guseoh.csforge.learning.api;

import java.time.Instant;
import com.guseoh.csforge.learning.application.ConceptAssessmentStatus;
import com.guseoh.csforge.learning.application.ConceptUnderstandingView;
import com.guseoh.csforge.learning.domain.LearningStatus;

/** 읽기 완료와 채점 근거를 별도 필드로 제공한다. */
public record ConceptUnderstandingResponse(
        long conceptId,
        LearningStatus learningStatus,
        Evidence evidence,
        Double recentAccuracyPercent,
        ConceptAssessmentStatus assessmentStatus,
        Instant lastAssessedAt) {

    public record Evidence(int uniqueQuestions, long finalizedAttempts,
                           int correctQuestions, long pendingSelfCheckCount) {
    }

    public static ConceptUnderstandingResponse from(ConceptUnderstandingView view) {
        return new ConceptUnderstandingResponse(
                view.conceptId(), view.learningStatus(),
                new Evidence(view.evidence().uniqueQuestions(), view.evidence().finalizedAttempts(),
                        view.evidence().correctQuestions(), view.evidence().pendingSelfCheckCount()),
                view.recentAccuracyPercent(), view.assessmentStatus(), view.lastAssessedAt());
    }
}
