package com.guseoh.csforge.quiz.domain;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Quiz Attempt를 bounded 조회하고 저장하는 JPA repository이다.
 */
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    @EntityGraph(attributePaths = {"question", "selectedChoice"})
    List<Attempt> findByQuizSession_IdOrderByQuestion_IdAsc(long quizSessionId);

    @EntityGraph(attributePaths = {"question", "selectedChoice"})
    Optional<Attempt> findByQuizSession_IdAndQuestion_Id(long quizSessionId, long questionId);

    long countByQuizSession_IdAndAnsweredAtIsNotNull(long quizSessionId);

    long countByQuizSession_IdAndGradingStatus(long quizSessionId, AttemptGradingStatus gradingStatus);

    @EntityGraph(attributePaths = {"quizSession", "selectedChoice"})
    @Query("""
            select attempt
            from Attempt attempt
            where attempt.question.id = :questionId
            order by attempt.updatedAt desc, attempt.id desc
            """)
    List<Attempt> findQuestionHistoryFirst(@Param("questionId") long questionId, Pageable pageable);

    @EntityGraph(attributePaths = {"quizSession", "selectedChoice"})
    @Query("""
            select attempt
            from Attempt attempt
            where attempt.question.id = :questionId
              and (attempt.updatedAt < :cursorAt or (attempt.updatedAt = :cursorAt and attempt.id < :cursorId))
            order by attempt.updatedAt desc, attempt.id desc
            """)
    List<Attempt> findQuestionHistoryAfter(
            @Param("questionId") long questionId,
            @Param("cursorAt") Instant cursorAt,
            @Param("cursorId") long cursorId,
            Pageable pageable);
}
