package com.guseoh.csforge.quiz.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    @EntityGraph(attributePaths = {"question"})
    List<QuizQuestion> findByQuizSession_IdOrderByPositionAsc(long quizSessionId);

    Optional<QuizQuestion> findByQuizSession_IdAndQuestion_Id(long quizSessionId, long questionId);

    long countByQuizSession_Id(long quizSessionId);
}
