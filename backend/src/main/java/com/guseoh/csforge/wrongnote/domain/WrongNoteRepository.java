package com.guseoh.csforge.wrongnote.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 문제별 오답 노트 aggregate의 저장소이다.
 */
public interface WrongNoteRepository extends JpaRepository<WrongNote, Long> {

    @EntityGraph(attributePaths = {"question", "lastWrongAttempt", "lastWrongAttempt.selectedChoice"})
    Optional<WrongNote> findByQuestionId(long questionId);
}
