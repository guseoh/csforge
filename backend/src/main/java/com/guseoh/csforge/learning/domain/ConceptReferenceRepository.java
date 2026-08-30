package com.guseoh.csforge.learning.domain;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConceptReferenceRepository extends JpaRepository<ConceptReference, ConceptReferenceId> {

    @Query("""
            select cr
            from ConceptReference cr
            join fetch cr.reference
            where cr.concept.id = :conceptId
            order by cr.displayOrder, cr.reference.id
            """)
    List<ConceptReference> findAllByConceptId(@Param("conceptId") long conceptId);
}
