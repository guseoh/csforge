package com.guseoh.csforge.search.domain;

import java.time.Instant;
import java.util.UUID;

import com.guseoh.csforge.search.application.SearchChangeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 검색 projection 변경을 Kafka에 안전하게 전달하기 위한 transactional outbox 행이다. */
@Getter
@Entity
@Table(name = "search_outbox_event")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SearchOutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true)
    private UUID eventId;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 32)
    private SearchChangeType changeType;

    @Column(name = "source_id", nullable = false)
    private long sourceId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "next_attempt_at")
    private Instant nextAttemptAt;

    @Column(name = "last_error", length = 2000)
    private String lastError;

    private SearchOutboxEvent(SearchChangeType changeType, long sourceId, Instant occurredAt) {
        if (changeType == null || sourceId <= 0 || occurredAt == null) {
            throw new IllegalArgumentException("Invalid search outbox event");
        }
        this.eventId = UUID.randomUUID();
        this.changeType = changeType;
        this.sourceId = sourceId;
        this.createdAt = occurredAt;
        this.updatedAt = occurredAt;
        this.attemptCount = 0;
    }

    public static SearchOutboxEvent pending(SearchChangeType changeType, long sourceId, Instant occurredAt) {
        return new SearchOutboxEvent(changeType, sourceId, occurredAt);
    }

    public void refresh(Instant occurredAt) {
        if (publishedAt != null) throw new IllegalStateException("Published search outbox event cannot be refreshed");
        this.updatedAt = occurredAt;
        this.nextAttemptAt = null;
        this.lastError = null;
    }

    public void markPublished(Instant publishedAt) {
        this.publishedAt = publishedAt;
        this.updatedAt = publishedAt;
        this.nextAttemptAt = null;
        this.lastError = null;
    }

    public void markFailed(Instant attemptedAt, Instant nextAttemptAt, String error) {
        this.attemptCount++;
        this.updatedAt = attemptedAt;
        this.nextAttemptAt = nextAttemptAt;
        this.lastError = abbreviate(error, 2000);
    }

    private static String abbreviate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
