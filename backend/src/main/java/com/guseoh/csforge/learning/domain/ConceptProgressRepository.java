package com.guseoh.csforge.learning.domain;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ConceptProgressRepository extends JpaRepository<ConceptProgress, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from ConceptProgress p where p.conceptId = :conceptId")
    Optional<ConceptProgress> findForUpdate(@Param("conceptId") long conceptId);
}
