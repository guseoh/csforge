package com.guseoh.csforge.question.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** contentKey로 Question canonical aggregate를 묶음 조회하는 저장소이다. */
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByContentKeyIn(Collection<String> contentKeys);
}
