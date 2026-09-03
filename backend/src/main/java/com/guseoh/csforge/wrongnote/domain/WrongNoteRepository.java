package com.guseoh.csforge.wrongnote.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import jakarta.persistence.LockModeType;

/**
 * 문제별 오답 노트 aggregate의 저장소이다.
 */
public interface WrongNoteRepository extends JpaRepository<WrongNote, Long> {

    @EntityGraph(attributePaths = {"question", "lastWrongAttempt", "lastWrongAttempt.selectedChoice"})
    Optional<WrongNote> findByQuestionId(long questionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"question", "lastWrongAttempt", "lastWrongAttempt.question", "lastWrongAttempt.selectedChoice"})
    @Query("select note from WrongNote note where note.question.id = :questionId")
    Optional<WrongNote> findByQuestionIdForUpdate(@Param("questionId") long questionId);
}
