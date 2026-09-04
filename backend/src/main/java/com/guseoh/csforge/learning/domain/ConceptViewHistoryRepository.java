package com.guseoh.csforge.learning.domain;

import org.springframework.data.jpa.repository.JpaRepository;

/** Concept 열람 이력을 저장하는 repository이다. */
public interface ConceptViewHistoryRepository extends JpaRepository<ConceptViewHistory, Long> {
}
