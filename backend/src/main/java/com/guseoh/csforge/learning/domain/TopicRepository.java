package com.guseoh.csforge.learning.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** 가져오기 대상 Topic을 묶음으로 조회하는 저장소이다. */
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByContentKeyIn(Collection<String> contentKeys);
}
