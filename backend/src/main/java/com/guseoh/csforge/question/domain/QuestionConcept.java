package com.guseoh.csforge.question.domain;

import lombok.Getter;

import com.guseoh.csforge.learning.domain.Concept;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

/**
 * 문제와 학습 Concept의 다대다 연결을 표현하는 연관 엔티티이다.
 */
@Getter
@Entity
@Table(name = "question_concept")
public class QuestionConcept {

    @EmbeddedId
    private QuestionConceptId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("questionId")
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("conceptId")
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    protected QuestionConcept() {
    }

    QuestionConcept(Question question, Concept concept) {
        this.question = question;
        this.concept = concept;
        this.id = new QuestionConceptId(null, concept.getId());
    }
}
