package com.guseoh.csforge.question.domain;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

/**
 * Question과 Concept 연결 엔티티의 복합 식별자를 표현하는 값 타입이다.
 */
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
        if (this == other) {
            return true;
        }
        if (!(other instanceof QuestionConceptId that)) {
            return false;
        }
        return Objects.equals(questionId, that.questionId)
                && Objects.equals(conceptId, that.conceptId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(questionId, conceptId);
    }
}
