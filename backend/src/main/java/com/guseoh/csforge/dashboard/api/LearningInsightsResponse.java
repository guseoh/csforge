package com.guseoh.csforge.dashboard.api;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import com.guseoh.csforge.dashboard.application.LearningInsightsView;

/** 학습 진단 API의 기간 경계·근거·제한을 노출한다. */
public record LearningInsightsResponse(
        Instant asOf, LocalDate studyDate, String zoneId, String range, String area,
        Period current, Period previous, boolean comparable, String comparisonReason,
        long overdueCount, long dueNowCount, List<WeakConcept> weakConcepts) {

    public record Period(LocalDate from, LocalDate through, long finalizedAttempts,
                         long correctAttempts, long wrongAttempts, long uniqueQuestions,
                         long pendingSelfCheck, long viewedConcepts, Double accuracyPercent) {
        static Period from(LearningInsightsView.Period value) {
            return new Period(value.from(), value.through(), value.finalizedAttempts(),
                    value.correctAttempts(), value.wrongAttempts(), value.uniqueQuestions(),
                    value.pendingSelfCheck(), value.viewedConcepts(), value.accuracyPercent());
        }
    }

    public record WeakConcept(long conceptId, String title, String areaSlug, String areaName,
                              long wrongAttempts, long dueQuestions, Instant lastWrongAt,
                              int distinctQuestions, int correctQuestions,
                              Double evidenceAccuracyPercent, String assessmentStatus) {
        static WeakConcept from(LearningInsightsView.WeakConcept value) {
            return new WeakConcept(value.conceptId(), value.title(), value.areaSlug(), value.areaName(),
                    value.wrongAttempts(), value.dueQuestions(), value.lastWrongAt(),
                    value.distinctQuestions(), value.correctQuestions(),
                    value.evidenceAccuracyPercent(), value.assessmentStatus());
        }
    }

    public static LearningInsightsResponse from(LearningInsightsView view) {
        return new LearningInsightsResponse(view.asOf(), view.studyDate(), view.zoneId(),
                view.range(), view.area(), Period.from(view.current()), Period.from(view.previous()),
                view.comparable(), view.comparisonReason(), view.overdueCount(), view.dueNowCount(),
                view.weakConcepts().stream().map(WeakConcept::from).toList());
    }
}
