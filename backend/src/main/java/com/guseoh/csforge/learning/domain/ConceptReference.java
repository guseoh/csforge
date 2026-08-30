package com.guseoh.csforge.learning.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

/** Concept와 Reference의 canonical 연결 및 표시 메타데이터를 표현한다. */
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

    private ConceptReference(Concept concept, Reference reference, int displayOrder, String relationNote) {
        this.concept = concept;
        this.reference = reference;
        this.id = new ConceptReferenceId(concept.getId(), reference.getId());
        this.displayOrder = displayOrder;
        this.relationNote = relationNote;
    }

    public static ConceptReference link(Concept concept, Reference reference, int displayOrder, String relationNote) {
        if (concept == null || reference == null || displayOrder < 0) throw new IllegalArgumentException("Invalid concept reference");
        return new ConceptReference(concept, reference, displayOrder, relationNote);
    }

    public void reviseRelation(int displayOrder, String relationNote) {
        if (displayOrder < 0) throw new IllegalArgumentException("displayOrder must be non-negative");
        this.displayOrder = displayOrder;
        this.relationNote = relationNote;
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
