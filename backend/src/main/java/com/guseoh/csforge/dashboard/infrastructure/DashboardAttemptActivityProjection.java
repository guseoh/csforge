package com.guseoh.csforge.dashboard.infrastructure;

import java.time.Instant;

/** 기간 내 finalized Attempt의 최소 활동 필드 projection이다. */
public record DashboardAttemptActivityProjection(long attemptId, boolean correct, Instant gradedAt) {
}
