package com.guseoh.csforge.quiz.domain;

import java.time.Instant;

import com.guseoh.csforge.learning.domain.AuditedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "quiz_session")
public class QuizSession extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private QuizSessionStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "last_position", nullable = false)
    private int lastPosition;

    protected QuizSession() {
    }

    private QuizSession(Instant startedAt, Instant expiresAt) {
        this.status = QuizSessionStatus.IN_PROGRESS;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
        this.lastPosition = 0;
    }

    public static QuizSession start(Instant startedAt, Instant expiresAt) {
        if (startedAt == null) {
            throw new IllegalArgumentException("startedAt is required");
        }
        if (expiresAt != null && expiresAt.isBefore(startedAt)) {
            throw new IllegalArgumentException("expiresAt cannot be before startedAt");
        }
        return new QuizSession(startedAt, expiresAt);
    }

    public void ensureAcceptingChanges(Instant now) {
        if (status != QuizSessionStatus.IN_PROGRESS) {
            throw new QuizInvalidStateException("Quiz session is no longer in progress");
        }
        if (isExpired(now)) {
            throw new QuizExpiredException("Quiz session has expired");
        }
    }

    public void recordPosition(int position, int questionCount) {
        if (status != QuizSessionStatus.IN_PROGRESS) {
            throw new QuizInvalidStateException("Quiz position can only change while in progress");
        }
        if (questionCount <= 0 || position < 0 || position >= questionCount) {
            throw new QuizAnswerException("Quiz position is outside the question range");
        }
        this.lastPosition = position;
    }

    public void submit(Instant now) {
        if (status == QuizSessionStatus.IN_PROGRESS) {
            status = QuizSessionStatus.SUBMITTED;
            submittedAt = now;
            return;
        }
        if (status != QuizSessionStatus.SUBMITTED && status != QuizSessionStatus.COMPLETED) {
            throw new QuizInvalidStateException("Quiz session cannot be submitted");
        }
    }

    public void complete(Instant now) {
        if (status == QuizSessionStatus.COMPLETED) {
            return;
        }
        if (status != QuizSessionStatus.SUBMITTED) {
            throw new QuizInvalidStateException("Quiz session must be submitted before completion");
        }
        status = QuizSessionStatus.COMPLETED;
        completedAt = now;
    }

    public boolean isExpired(Instant now) {
        return expiresAt != null && !now.isBefore(expiresAt);
    }

    public Long getId() {
        return id;
    }

    public QuizSessionStatus getStatus() {
        return status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public int getLastPosition() {
        return lastPosition;
    }
}
