package com.guseoh.csforge.learning.application;

/** 충분한 서로 다른 문제를 풀었을 때만 이해도 추세를 분류한다. */
public final class ConceptUnderstandingPolicy {

    public static final int RECENT_DISTINCT_QUESTIONS = 10;
    public static final int MIN_UNIQUE_QUESTIONS = 3;

    private ConceptUnderstandingPolicy() {
    }

    public static ConceptAssessmentStatus classify(int uniqueQuestions, int correctQuestions) {
        if (uniqueQuestions < MIN_UNIQUE_QUESTIONS) return ConceptAssessmentStatus.NOT_ENOUGH_EVIDENCE;
        int accuracy = correctQuestions * 100 / uniqueQuestions;
        if (accuracy < 50) return ConceptAssessmentStatus.NEEDS_PRACTICE;
        if (accuracy < 80) return ConceptAssessmentStatus.DEVELOPING;
        return ConceptAssessmentStatus.CONSISTENT;
    }
}
