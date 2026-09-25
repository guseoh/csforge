package com.guseoh.csforge.quiz.application;

/** Quiz의 확정된 성과 집계와 정확도 의미를 표현하는 값 모델이다. */
public record QuizPerformance(
        long totalCount,
        long correctCount,
        long wrongCount,
        long unansweredCount,
        long selfCheckPendingCount) {

    public QuizPerformance {
        if (totalCount < 0 || correctCount < 0 || wrongCount < 0 || unansweredCount < 0 || selfCheckPendingCount < 0) {
            throw new IllegalArgumentException("Quiz performance counts cannot be negative");
        }
        if (totalCount != correctCount + wrongCount + unansweredCount + selfCheckPendingCount) {
            throw new IllegalArgumentException("Quiz performance counts must add up to totalCount");
        }
    }

    public long finalizedCount() {
        return correctCount + wrongCount + unansweredCount;
    }

    public Double accuracy() {
        long finalized = finalizedCount();
        return finalized == 0 ? null : (double) correctCount / finalized;
    }

    public Double accuracyPercent() {
        Double value = accuracy();
        return value == null ? null : value * 100.0;
    }
}
