package com.guseoh.csforge.dashboard.infrastructure;

import java.time.Instant;

/** 기간 내 Concept 열람 이력의 최소 활동 필드 projection이다. */
public record DashboardConceptViewProjection(long conceptId, Instant viewedAt) {
}
