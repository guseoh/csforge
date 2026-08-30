package com.guseoh.csforge.quiz.domain;

import java.time.Instant;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.learning.domain.AuditedEntity;
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

@Entity
@Table(name = "attempt", uniqueConstraints = {
        @UniqueConstraint(name = "uq_attempt_session_question", columnNames = {"quiz_session_id", "question_id"})
})
public class Attempt extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_session_id", nullable = false)
    private QuizSession quizSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_choice_id")
    private QuestionChoice selectedChoice;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "review_needed", nullable = false)
    private boolean reviewNeeded;

    @Enumerated(EnumType.STRING)
    @Column(name = "grading_status", nullable = false, length = 32)
    private AttemptGradingStatus gradingStatus;

    @Column(name = "correct")
    private Boolean correct;

    @Column(name = "answered_at")
    private Instant answeredAt;

    @Column(name = "graded_at")
    private Instant gradedAt;

    protected Attempt() {
    }

    private Attempt(QuizSession quizSession, Question question) {
        if (quizSession == null || question == null) {
            throw new IllegalArgumentException("quizSession and question are required");
        }
        this.quizSession = quizSession;
        this.question = question;
        this.gradingStatus = AttemptGradingStatus.UNANSWERED;
        this.reviewNeeded = false;
    }

    public static Attempt unanswered(QuizSession quizSession, Question question) {
        return new Attempt(quizSession, question);
    }

    public void saveChoice(QuestionChoice choice, Instant answeredAt) {
        if (choice == null) {
            throw new QuizAnswerException("selectedChoice is required");
        }
        this.selectedChoice = choice;
        this.answerText = null;
        this.answeredAt = answeredAt;
        resetGrading();
    }

    public void clearChoice(Instant changedAt) {
        this.selectedChoice = null;
        this.answeredAt = null;
        resetGrading();
        if (answerText == null) {
            this.gradedAt = null;
        }
    }

    public void saveText(String text, Instant answeredAt) {
        if (text == null || text.isBlank()) {
            this.answerText = null;
            this.answeredAt = null;
        } else {
            this.answerText = text;
            this.answeredAt = answeredAt;
        }
        this.selectedChoice = null;
        resetGrading();
    }

    public void markReviewNeeded() {
        this.reviewNeeded = true;
    }

    public void clearReviewNeeded() {
        this.reviewNeeded = false;
    }

    public void gradeAutomatically(boolean correct, Instant gradedAt) {
        this.gradingStatus = AttemptGradingStatus.GRADED;
        this.correct = correct;
        this.gradedAt = gradedAt;
    }

    public void requireSelfCheck(Instant gradedAt) {
        if (!hasAnswer()) {
            gradeAutomatically(false, gradedAt);
            return;
        }
        this.gradingStatus = AttemptGradingStatus.SELF_CHECK_REQUIRED;
        this.correct = null;
        this.gradedAt = gradedAt;
    }

    public void completeSelfCheck(boolean correct, Instant checkedAt) {
        if (gradingStatus == AttemptGradingStatus.SELF_CHECKED) {
            if (Boolean.valueOf(correct).equals(this.correct)) {
                return;
            }
            throw new QuizInvalidStateException("Self-check result cannot be changed");
        }
        if (gradingStatus != AttemptGradingStatus.SELF_CHECK_REQUIRED) {
            throw new QuizInvalidStateException("This attempt is not waiting for self-check");
        }
        this.gradingStatus = AttemptGradingStatus.SELF_CHECKED;
        this.correct = correct;
        this.gradedAt = checkedAt;
    }

    private void resetGrading() {
        this.gradingStatus = AttemptGradingStatus.UNANSWERED;
        this.correct = null;
        this.gradedAt = null;
    }

    public boolean hasAnswer() {
        return selectedChoice != null || (answerText != null && !answerText.isBlank());
    }

    public boolean isFinalized() {
        return gradingStatus == AttemptGradingStatus.GRADED || gradingStatus == AttemptGradingStatus.SELF_CHECKED;
    }

    public boolean isWrong() {
        return isFinalized() && Boolean.FALSE.equals(correct);
    }

    public Long getId() { return id; }
    public QuizSession getQuizSession() { return quizSession; }
    public Question getQuestion() { return question; }
    public QuestionChoice getSelectedChoice() { return selectedChoice; }
    public String getAnswerText() { return answerText; }
    public boolean isReviewNeeded() { return reviewNeeded; }
    public AttemptGradingStatus getGradingStatus() { return gradingStatus; }
    public Boolean getCorrect() { return correct; }
    public Instant getAnsweredAt() { return answeredAt; }
    public Instant getGradedAt() { return gradedAt; }
}
