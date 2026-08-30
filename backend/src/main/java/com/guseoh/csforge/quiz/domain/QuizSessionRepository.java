package com.guseoh.csforge.quiz.domain;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    Optional<QuizSession> findFirstByStatusOrderByStartedAtDescIdDesc(QuizSessionStatus status);
}
