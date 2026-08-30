package com.guseoh.csforge.question.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "question_choice")
public class QuestionChoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "choice_key", nullable = false, length = 8)
    private String choiceKey;

    @Column(name = "content_markdown", nullable = false, columnDefinition = "TEXT")
    private String contentMarkdown;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    protected QuestionChoice() {
    }

    QuestionChoice(Question question, String choiceKey, String contentMarkdown, int displayOrder) {
        this.question = question;
        this.choiceKey = choiceKey;
        this.contentMarkdown = contentMarkdown;
        this.displayOrder = displayOrder;
    }

    public Long getId() {
        return id;
    }

    public Question getQuestion() {
        return question;
    }

    public String getChoiceKey() {
        return choiceKey;
    }

    public String getContentMarkdown() {
        return contentMarkdown;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }
}
