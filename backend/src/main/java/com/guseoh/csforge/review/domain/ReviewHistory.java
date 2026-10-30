package com.guseoh.csforge.review.domain;

import java.time.Instant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizSession;
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

/**
 * 복습 시도별 불변 이력을 보존하는 도메인 엔티티이다.
 */
@Getter
@Entity
@Table(name = "review_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReviewHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_session_id", nullable = false)
    private QuizSession quizSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false, unique = true)
    private Attempt attempt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReviewResult result;

    @Column(name = "stage_before", nullable = false)
    private short stageBefore;

    @Column(name = "stage_after")
    private Short stageAfter;

    @Column(name = "reviewed_at", nullable = false)
    private Instant reviewedAt;

    @Column(name = "next_due_at")
    private Instant nextDueAt;

    private ReviewHistory(Attempt attempt, ReviewTransition transition) {
        this.question = attempt.getQuestion();
        this.quizSession = attempt.getQuizSession();
        this.attempt = attempt;
        this.result = transition.result();
        this.stageBefore = (short) transition.stageBefore();
        this.stageAfter = transition.stageAfter() == null ? null : transition.stageAfter().shortValue();
        this.reviewedAt = transition.reviewedAt();
        this.nextDueAt = transition.nextDueAt();
    }

    public static ReviewHistory record(Attempt attempt, ReviewTransition transition) {
        return new ReviewHistory(attempt, transition);
    }
}
