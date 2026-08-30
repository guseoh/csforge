package com.guseoh.csforge.review.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.quiz.domain.Attempt;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

/**
 * 문제 하나의 복습 단계, 예정 시각과 숙련 상태 전이를 관리한다.
 */
@Getter
@Entity
@Table(name = "review_schedule")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReviewSchedule {

    private static final Duration FIRST_INTERVAL = Duration.ofDays(1);
    private static final Duration SECOND_INTERVAL = Duration.ofDays(3);
    private static final Duration THIRD_INTERVAL = Duration.ofDays(7);
    private static final Duration FOURTH_INTERVAL = Duration.ofDays(14);

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @MapsId
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReviewScheduleStatus status;

    @Column(nullable = false)
    private short stage;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(name = "last_reviewed_at")
    private Instant lastReviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_processed_attempt_id")
    private Attempt lastProcessedAttempt;

    private ReviewSchedule(Question question, Attempt attempt, Instant now) {
        this.question = Objects.requireNonNull(question, "question is required");
        this.questionId = question.getId();
        this.status = ReviewScheduleStatus.SCHEDULED;
        this.stage = 1;
        this.dueAt = Objects.requireNonNull(now, "now is required").plus(FIRST_INTERVAL);
        this.lastProcessedAttempt = attempt;
    }

    public static ReviewSchedule start(Question question, Attempt attempt, Instant now) {
        return new ReviewSchedule(question, attempt, now);
    }

    public boolean processedAttempt(long attemptId) {
        return lastProcessedAttempt != null
                && lastProcessedAttempt.getId() != null
                && lastProcessedAttempt.getId().equals(attemptId);
    }

    public void restartFromFirstStage(Attempt attempt, Instant now) {
        Objects.requireNonNull(attempt, "attempt is required");
        Objects.requireNonNull(now, "now is required");
        if (processedAttempt(attempt.getId())) {
            return;
        }
        status = ReviewScheduleStatus.SCHEDULED;
        stage = 1;
        dueAt = now.plus(FIRST_INTERVAL);
        lastReviewedAt = null;
        lastProcessedAttempt = attempt;
    }

    public void scheduleFromFirstStage(Instant now) {
        Objects.requireNonNull(now, "now is required");
        if (status == ReviewScheduleStatus.SCHEDULED && stage == 1 && dueAt != null) {
            return;
        }
        status = ReviewScheduleStatus.SCHEDULED;
        stage = 1;
        dueAt = now.plus(FIRST_INTERVAL);
        lastReviewedAt = null;
        lastProcessedAttempt = null;
    }

    public ReviewTransition applyReviewOutcome(Attempt attempt, boolean correct, Instant now) {
        Objects.requireNonNull(attempt, "attempt is required");
        Objects.requireNonNull(now, "now is required");
        ReviewResult result = correct ? ReviewResult.CORRECT : ReviewResult.WRONG;
        if (processedAttempt(attempt.getId())) {
            return new ReviewTransition(result, stage, status == ReviewScheduleStatus.MASTERED ? null : (int) stage,
                    lastReviewedAt, dueAt, false);
        }
        int stageBefore = stage;
        Integer stageAfter;
        if (!correct) {
            status = ReviewScheduleStatus.SCHEDULED;
            stage = 1;
            dueAt = now.plus(FIRST_INTERVAL);
            stageAfter = 1;
        } else if (stage >= 4) {
            status = ReviewScheduleStatus.MASTERED;
            dueAt = null;
            stageAfter = null;
        } else {
            stage++;
            dueAt = now.plus(intervalFor(stage));
            stageAfter = (int) stage;
        }
        lastReviewedAt = now;
        lastProcessedAttempt = attempt;
        return new ReviewTransition(result, stageBefore, stageAfter, now, dueAt, true);
    }

    private static Duration intervalFor(int stage) {
        return switch (stage) {
            case 2 -> SECOND_INTERVAL;
            case 3 -> THIRD_INTERVAL;
            case 4 -> FOURTH_INTERVAL;
            default -> throw new IllegalArgumentException("Unsupported review stage: " + stage);
        };
    }
}
