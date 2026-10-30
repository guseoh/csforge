package com.guseoh.csforge.dashboard.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** 기간별 학습량과 별개로 고유 문제 기반의 취약 Concept 근거를 제공하는 읽기 모델이다. */
public record LearningInsightsView(
        Instant asOf, LocalDate studyDate, String zoneId, String range, String area,
        Period current, Period previous, boolean comparable, String comparisonReason,
        long overdueCount, long dueNowCount, List<WeakConcept> weakConcepts) {

    public record Period(LocalDate from, LocalDate through, long finalizedAttempts, long correctAttempts,
                         long wrongAttempts, long uniqueQuestions, long pendingSelfCheck,
                         long viewedConcepts, Double accuracyPercent) {
    }

    public record WeakConcept(long conceptId, String title, String areaSlug, String areaName,
                              long wrongAttempts, long dueQuestions, Instant lastWrongAt,
                              int distinctQuestions, int correctQuestions,
                              Double evidenceAccuracyPercent, String assessmentStatus) {
    }
}
