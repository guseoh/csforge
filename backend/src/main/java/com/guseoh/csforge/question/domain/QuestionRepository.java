package com.guseoh.csforge.question.domain;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Question canonical aggregate를 조회하고 저장하는 저장소이다. */
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByContentKeyIn(Collection<String> contentKeys);

    boolean existsByIdAndStatus(long id, QuestionStatus status);
}
