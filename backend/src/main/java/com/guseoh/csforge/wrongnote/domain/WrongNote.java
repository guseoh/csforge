package com.guseoh.csforge.wrongnote.domain;

import java.time.Instant;

import lombok.Getter;

import com.guseoh.csforge.learning.domain.AuditedEntity;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.quiz.domain.Attempt;
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
 * 문제 하나에 대한 현재 오답 상태와 개인 원인을 관리하는 도메인 aggregate이다.
 */
@Getter
@Entity
@Table(name = "wrong_note")
public class WrongNote extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private WrongNoteStatus status;

    @Column(name = "wrong_count", nullable = false)
    private int wrongCount;

    @Column(name = "first_wrong_at", nullable = false)
    private Instant firstWrongAt;

    @Column(name = "last_wrong_at", nullable = false)
    private Instant lastWrongAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "last_wrong_attempt_id")
    private Attempt lastWrongAttempt;

    @Column(name = "cause_note", columnDefinition = "TEXT")
    private String causeNote;

    protected WrongNote() {
    }

    private WrongNote(Question question, Attempt attempt, Instant occurredAt) {
        this.question = require(question, "question");
        this.status = WrongNoteStatus.ACTIVE;
        this.wrongCount = 1;
        this.firstWrongAt = require(occurredAt, "occurredAt");
        this.lastWrongAt = occurredAt;
        this.lastWrongAttempt = require(attempt, "attempt");
    }

    public static WrongNote open(Question question, Attempt attempt, Instant occurredAt) {
        return new WrongNote(question, attempt, occurredAt);
    }

    public void recordWrong(Attempt attempt, Instant occurredAt) {
        require(attempt, "attempt");
        require(occurredAt, "occurredAt");
        if (lastWrongAttempt != null && lastWrongAttempt.getId().equals(attempt.getId())) {
            return;
        }
        wrongCount++;
        lastWrongAt = occurredAt;
        lastWrongAttempt = attempt;
        status = WrongNoteStatus.ACTIVE;
    }

    public void markMastered() {
        status = WrongNoteStatus.MASTERED;
    }

    public void replaceCauseNote(String causeNote) {
        this.causeNote = causeNote == null || causeNote.isBlank() ? null : causeNote;
    }

    private static <T> T require(T value, String name) {
        if (value == null) {
            throw new IllegalArgumentException(name + " is required");
        }
        return value;
    }
}
