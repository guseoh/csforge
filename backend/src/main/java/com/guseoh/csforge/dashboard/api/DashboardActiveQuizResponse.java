package com.guseoh.csforge.dashboard.api;

import java.time.Instant;

/** 재개 가능한 active Quiz API 응답이다. */
public record DashboardActiveQuizResponse(
        long quizId,
        int questionCount,
        int answeredCount,
        int lastPosition,
        Instant startedAt,
        Instant expiresAt) {
}
