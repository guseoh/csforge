package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "personal_note")
public class PersonalNote extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "concept_id", nullable = false, unique = true)
    private Concept concept;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    protected PersonalNote() {
    }

    public PersonalNote(Concept concept, String content) {
        this.concept = concept;
        this.content = content;
    }

    public void changeContent(String content) {
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public Long getConceptId() {
        return concept.getId();
    }

    public String getContent() {
        return content;
    }
}
