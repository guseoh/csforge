package com.guseoh.csforge.quiz.domain;

import java.util.Optional;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    Optional<QuizSession> findFirstByStatusOrderByStartedAtDescIdDesc(QuizSessionStatus status);

    List<QuizSession> findTop5ByStatusInOrderByStartedAtDescIdDesc(Collection<QuizSessionStatus> statuses);
}
