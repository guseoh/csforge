package com.guseoh.csforge.learning.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** 가져오기에서 기존 V1 영역을 검증하는 저장소이다. */
public interface LearningAreaRepository extends JpaRepository<LearningArea, Long> {
    List<LearningArea> findBySlugIn(Collection<String> slugs);
}
