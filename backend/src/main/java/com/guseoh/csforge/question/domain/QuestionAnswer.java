package com.guseoh.csforge.question.domain;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
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

@Entity
@Table(name = "question_answer")
public class QuestionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(name = "answer_kind", nullable = false, length = 32)
    private QuestionAnswerKind answerKind;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "choice_id")
    private QuestionChoice choice;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected QuestionAnswer() {
    }

    static QuestionAnswer correctChoice(Question question, QuestionChoice choice) {
        return new QuestionAnswer(question, QuestionAnswerKind.CORRECT_CHOICE, choice, null, 0);
    }

    static QuestionAnswer acceptedText(Question question, String answerText, int displayOrder) {
        return new QuestionAnswer(question, QuestionAnswerKind.ACCEPTED_TEXT, null, answerText, displayOrder);
    }

    static QuestionAnswer modelAnswer(Question question, String answerText) {
        return new QuestionAnswer(question, QuestionAnswerKind.MODEL_ANSWER, null, answerText, 0);
    }

    private QuestionAnswer(
            Question question,
            QuestionAnswerKind answerKind,
            QuestionChoice choice,
            String answerText,
            int displayOrder) {
        this.question = question;
        this.answerKind = answerKind;
        this.choice = choice;
        this.answerText = answerText;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public Question getQuestion() {
        return question;
    }

    public QuestionAnswerKind getAnswerKind() {
        return answerKind;
    }

    public QuestionChoice getChoice() {
        return choice;
    }

    public String getAnswerText() {
        return answerText;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
