package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "concept_reference")
public class ConceptReference {

    @EmbeddedId
    private ConceptReferenceId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("conceptId")
    @JoinColumn(name = "concept_id", nullable = false)
    private Concept concept;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("referenceId")
    @JoinColumn(name = "reference_id", nullable = false)
    private Reference reference;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "relation_note", columnDefinition = "TEXT")
    private String relationNote;

    protected ConceptReference() {
    }

    public ConceptReferenceId getId() {
        return id;
    }

    public Concept getConcept() {
        return concept;
    }

    public Reference getReference() {
        return reference;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public String getRelationNote() {
        return relationNote;
    }
}
