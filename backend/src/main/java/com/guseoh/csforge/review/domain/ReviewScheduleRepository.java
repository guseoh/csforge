package com.guseoh.csforge.review.domain;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 문제별 복습 일정의 저장소이다.
 */
public interface ReviewScheduleRepository extends JpaRepository<ReviewSchedule, Long> {

    Optional<ReviewSchedule> findByQuestionId(long questionId);

    List<ReviewSchedule> findByQuestionIdIn(List<Long> questionIds);

    long countByStatus(ReviewScheduleStatus status);

    long countByStatusAndDueAtBefore(ReviewScheduleStatus status, Instant before);

    @Query("select count(schedule) from ReviewSchedule schedule where schedule.status = :status and schedule.dueAt <= :until")
    long countScheduledDueBefore(@Param("status") ReviewScheduleStatus status, @Param("until") Instant until);

    @Query("select schedule.questionId from ReviewSchedule schedule where schedule.status = :status and schedule.dueAt <= :until order by schedule.dueAt asc, schedule.questionId asc")
    List<Long> findEligibleQuestionIds(
            @Param("status") ReviewScheduleStatus status,
            @Param("until") Instant until,
            Pageable pageable);
}
