package com.guseoh.csforge.learning.domain;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ConceptReferenceId implements Serializable {

    @Column(name = "concept_id")
    private Long conceptId;

    @Column(name = "reference_id")
    private Long referenceId;

    protected ConceptReferenceId() {
    }

    public ConceptReferenceId(Long conceptId, Long referenceId) {
        this.conceptId = conceptId;
        this.referenceId = referenceId;
    }

    public Long getConceptId() {
        return conceptId;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof ConceptReferenceId that)) {
            return false;
        }
        return conceptId.equals(that.conceptId) && referenceId.equals(that.referenceId);
    }

    @Override
    public int hashCode() {
        return 31 * conceptId.hashCode() + referenceId.hashCode();
    }
}
