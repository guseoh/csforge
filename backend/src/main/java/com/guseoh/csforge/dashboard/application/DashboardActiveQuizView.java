package com.guseoh.csforge.dashboard.application;

import java.time.Instant;

/** 현재 진행 중인 Quiz의 재개용 요약이다. */
public record DashboardActiveQuizView(
        long quizId,
        int questionCount,
        int answeredCount,
        int lastPosition,
        Instant startedAt,
        Instant expiresAt) {
}
