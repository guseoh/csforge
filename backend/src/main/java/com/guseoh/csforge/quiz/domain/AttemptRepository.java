package com.guseoh.csforge.quiz.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    @EntityGraph(attributePaths = {"question", "selectedChoice"})
    List<Attempt> findByQuizSession_IdOrderByQuestion_IdAsc(long quizSessionId);

    @EntityGraph(attributePaths = {"question", "selectedChoice"})
    Optional<Attempt> findByQuizSession_IdAndQuestion_Id(long quizSessionId, long questionId);

    long countByQuizSession_IdAndAnsweredAtIsNotNull(long quizSessionId);

    long countByQuizSession_IdAndGradingStatus(long quizSessionId, AttemptGradingStatus gradingStatus);
}
