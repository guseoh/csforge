package com.guseoh.csforge.question.domain;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class QuestionConceptId implements Serializable {

    private Long questionId;
    private Long conceptId;

    protected QuestionConceptId() {
    }

    QuestionConceptId(Long questionId, Long conceptId) {
        this.questionId = questionId;
        this.conceptId = conceptId;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public Long getConceptId() {
        return conceptId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof QuestionConceptId that)) return false;
        return java.util.Objects.equals(questionId, that.questionId)
                && java.util.Objects.equals(conceptId, that.conceptId);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(questionId, conceptId);
    }
}
