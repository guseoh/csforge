package com.guseoh.csforge.learning.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** URL identity로 canonical Reference를 묶음 조회하는 저장소이다. */
public interface ReferenceRepository extends JpaRepository<Reference, Long> {
    List<Reference> findByUrlIn(Collection<String> urls);
}
