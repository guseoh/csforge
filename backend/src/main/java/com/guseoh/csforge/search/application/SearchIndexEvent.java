package com.guseoh.csforge.search.application;

import java.time.Instant;
import java.util.UUID;

/** Kafka로 전달되는 최소 검색 색인 변경 이벤트이다. */
public record SearchIndexEvent(
        int schemaVersion,
        UUID eventId,
        SearchChangeType changeType,
        long sourceId,
        Instant occurredAt) {

    public static final int CURRENT_SCHEMA_VERSION = 1;
}
