package com.guseoh.csforge.ai.domain;

import java.time.Instant;
import java.util.Objects;

import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** 특정 finalized wrong Attempt에 귀속된 AI 오답 분석 job과 lifecycle을 관리한다. */
@Getter
@Entity
@Table(name = "wrong_answer_analysis", uniqueConstraints = {
        @UniqueConstraint(name = "wrong_answer_analysis_attempt_uk", columnNames = "attempt_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WrongAnswerAnalysis {

    private static final int MAX_ERROR_MESSAGE_LENGTH = 1_000;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wrong_note_id", nullable = false)
    private WrongNote wrongNote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private Attempt attempt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private WrongAnswerAnalysisStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_snapshot", nullable = false, columnDefinition = "jsonb")
    private String inputSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "result", columnDefinition = "jsonb")
    private String result;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(nullable = false, length = 160)
    private String model;

    @Column(name = "prompt_version", nullable = false, length = 32)
    private String promptVersion;

    @Column(name = "schema_version", nullable = false, length = 32)
    private String schemaVersion;

    @Column(name = "processing_token", length = 64)
    private String processingToken;

    @Column(name = "processing_attempt_count", nullable = false)
    private int processingAttemptCount;

    @Column(name = "next_attempt_at")
    private Instant nextAttemptAt;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "failed_at")
    private Instant failedAt;

    @Column(name = "error_code", length = 64)
    private String errorCode;

    @Column(name = "error_message", length = MAX_ERROR_MESSAGE_LENGTH)
    private String errorMessage;

    private WrongAnswerAnalysis(
            WrongNote wrongNote,
            Attempt attempt,
            String inputSnapshot,
            String provider,
            String model,
            String promptVersion,
            String schemaVersion,
            Instant requestedAt) {
        this.wrongNote = Objects.requireNonNull(wrongNote, "wrongNote is required");
        this.attempt = Objects.requireNonNull(attempt, "attempt is required");
        if (!attempt.isWrong() || !sameAttempt(wrongNote.getLastWrongAttempt(), attempt)) {
            throw new IllegalArgumentException("analysis must target the current wrong attempt");
        }
        this.inputSnapshot = requireText(inputSnapshot, "inputSnapshot");
        this.provider = requireText(provider, "provider");
        this.model = requireText(model, "model");
        this.promptVersion = requireText(promptVersion, "promptVersion");
        this.schemaVersion = requireText(schemaVersion, "schemaVersion");
        this.requestedAt = Objects.requireNonNull(requestedAt, "requestedAt is required");
        this.status = WrongAnswerAnalysisStatus.PENDING;
        this.processingAttemptCount = 0;
    }

    public static WrongAnswerAnalysis pending(
            WrongNote wrongNote,
            Attempt attempt,
            String inputSnapshot,
            String provider,
            String model,
            String promptVersion,
            String schemaVersion,
            Instant requestedAt) {
        return new WrongAnswerAnalysis(
                wrongNote, attempt, inputSnapshot, provider, model, promptVersion, schemaVersion, requestedAt);
    }

    public boolean isRunnable(Instant now, Instant staleBefore) {
        return switch (status) {
            case PENDING -> nextAttemptAt == null || !nextAttemptAt.isAfter(now);
            case PROCESSING -> startedAt != null && !startedAt.isAfter(staleBefore);
            case COMPLETED, FAILED -> false;
        };
    }

    public void claim(String token, Instant claimedAt) {
        if (status != WrongAnswerAnalysisStatus.PENDING
                || (nextAttemptAt != null && nextAttemptAt.isAfter(claimedAt))) {
            throw new IllegalStateException("analysis is not runnable");
        }
        startProcessing(token, claimedAt);
    }

    public void reclaim(String token, Instant claimedAt, Instant staleBefore) {
        if (status != WrongAnswerAnalysisStatus.PROCESSING
                || startedAt == null
                || startedAt.isAfter(staleBefore)) {
            throw new IllegalStateException("analysis processing lease is still active");
        }
        startProcessing(token, claimedAt);
    }

    private void startProcessing(String token, Instant claimedAt) {
        this.status = WrongAnswerAnalysisStatus.PROCESSING;
        this.processingToken = requireText(token, "processingToken");
        this.processingAttemptCount++;
        this.startedAt = Objects.requireNonNull(claimedAt, "claimedAt is required");
        this.nextAttemptAt = null;
        this.completedAt = null;
        this.failedAt = null;
        this.result = null;
        this.errorCode = null;
        this.errorMessage = null;
    }

    public boolean ownsProcessing(String token) {
        return status == WrongAnswerAnalysisStatus.PROCESSING
                && Objects.equals(processingToken, token);
    }

    public void complete(String token, String result, Instant completedAt) {
        ensureOwnership(token);
        this.status = WrongAnswerAnalysisStatus.COMPLETED;
        this.result = requireText(result, "result");
        this.completedAt = Objects.requireNonNull(completedAt, "completedAt is required");
        this.processingToken = null;
        this.nextAttemptAt = null;
        this.failedAt = null;
        this.errorCode = null;
        this.errorMessage = null;
    }

    public void fail(
            String token,
            String errorCode,
            String errorMessage,
            boolean retryable,
            int maxAttempts,
            Instant failedAt,
            Instant nextAttemptAt) {
        ensureOwnership(token);
        this.errorCode = requireText(errorCode, "errorCode");
        this.errorMessage = boundedMessage(errorMessage);
        this.processingToken = null;
        this.startedAt = null;
        this.result = null;
        if (retryable && processingAttemptCount < maxAttempts) {
            this.status = WrongAnswerAnalysisStatus.PENDING;
            this.nextAttemptAt = Objects.requireNonNull(nextAttemptAt, "nextAttemptAt is required");
            this.failedAt = null;
        } else {
            this.status = WrongAnswerAnalysisStatus.FAILED;
            this.nextAttemptAt = null;
            this.failedAt = Objects.requireNonNull(failedAt, "failedAt is required");
        }
    }

    public void retry(Instant retriedAt) {
        if (status != WrongAnswerAnalysisStatus.FAILED) {
            throw new IllegalStateException("only failed analysis can be retried");
        }
        this.status = WrongAnswerAnalysisStatus.PENDING;
        this.requestedAt = Objects.requireNonNull(retriedAt, "retriedAt is required");
        this.processingAttemptCount = 0;
        this.processingToken = null;
        this.nextAttemptAt = null;
        this.startedAt = null;
        this.completedAt = null;
        this.failedAt = null;
        this.result = null;
        this.errorCode = null;
        this.errorMessage = null;
    }

    private void ensureOwnership(String token) {
        if (!ownsProcessing(token)) {
            throw new IllegalStateException("analysis processing ownership has changed");
        }
    }

    private static String requireText(String value, String name) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(name + " is required");
        return value;
    }

    private static boolean sameAttempt(Attempt left, Attempt right) {
        if (left == right) return true;
        return left != null && right != null && left.getId() != null && left.getId().equals(right.getId());
    }

    private static String boundedMessage(String value) {
        if (value == null || value.isBlank()) return "AI analysis provider failed";
        return value.length() <= MAX_ERROR_MESSAGE_LENGTH
                ? value
                : value.substring(0, MAX_ERROR_MESSAGE_LENGTH);
    }
}
