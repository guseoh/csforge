package com.guseoh.csforge.quiz.domain;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 퀴즈 세션을 조회하고 저장하는 JPA 저장소이다.
 */
public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {

    Optional<QuizSession> findByCreationRequestId(UUID creationRequestId);

    Optional<QuizSession> findFirstByStatusOrderByStartedAtDescIdDesc(QuizSessionStatus status);

    List<QuizSession> findTop5ByStatusInOrderByStartedAtDescIdDesc(Collection<QuizSessionStatus> statuses);

    Page<QuizSession> findByStatusInOrderByStartedAtDescIdDesc(
            Collection<QuizSessionStatus> statuses,
            Pageable pageable);

    Page<QuizSession> findByStatusInAndSourceOrderByStartedAtDescIdDesc(
            Collection<QuizSessionStatus> statuses,
            QuizSessionSource source,
            Pageable pageable);
}
