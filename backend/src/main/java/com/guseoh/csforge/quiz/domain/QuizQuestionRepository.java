package com.guseoh.csforge.quiz.domain;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {

    @Query("select distinct item.question.id from QuizQuestion item where item.question.id in :questionIds")
    List<Long> findQuestionIdsInSessions(@Param("questionIds") java.util.Collection<Long> questionIds);

    @EntityGraph(attributePaths = {"question"})
    List<QuizQuestion> findByQuizSession_IdOrderByPositionAsc(long quizSessionId);

    Optional<QuizQuestion> findByQuizSession_IdAndQuestion_Id(long quizSessionId, long questionId);

    long countByQuizSession_Id(long quizSessionId);
}
