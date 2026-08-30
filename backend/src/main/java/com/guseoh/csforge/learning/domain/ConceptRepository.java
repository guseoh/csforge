package com.guseoh.csforge.learning.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConceptRepository extends JpaRepository<Concept, Long> {

    @Query("select c from Concept c where c.id = :id and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED")
    Optional<Concept> findPublishedById(@Param("id") Long id);
}
