package com.guseoh.csforge.dashboard.infrastructure;

/** Quiz별 고정 문항 수 projection이다. */
public record DashboardQuizQuestionCountProjection(long quizId, long questionCount) {
}
