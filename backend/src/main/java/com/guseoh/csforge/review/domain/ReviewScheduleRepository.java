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

    @Query("select schedule.questionId from ReviewSchedule schedule where schedule.questionId in :questionIds")
    List<Long> findQuestionIdsWithSchedules(@Param("questionIds") java.util.Collection<Long> questionIds);

    Optional<ReviewSchedule> findByQuestionId(long questionId);

    List<ReviewSchedule> findByQuestionIdIn(List<Long> questionIds);

    long countByStatus(ReviewScheduleStatus status);

    long countByStatusAndDueAtBefore(ReviewScheduleStatus status, Instant before);

    @Query("""
            select new com.guseoh.csforge.review.domain.ReviewSummaryCounts(
                coalesce(sum(case when schedule.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED
                    and schedule.dueAt < :startOfToday then 1L else 0L end), 0L),
                coalesce(sum(case when schedule.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED
                    and schedule.dueAt >= :startOfToday and schedule.dueAt <= :now then 1L else 0L end), 0L),
                coalesce(sum(case when schedule.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED
                    and schedule.dueAt > :now and schedule.dueAt <= :next24Hours then 1L else 0L end), 0L),
                coalesce(sum(case when schedule.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED
                    and schedule.dueAt > :next24Hours and schedule.dueAt <= :next7Days then 1L else 0L end), 0L),
                coalesce(sum(case when schedule.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.MASTERED
                    then 1L else 0L end), 0L)
            )
            from ReviewSchedule schedule
            where exists (
                select 1 from QuestionConcept link
                where link.question = schedule.question
                  and link.question.status = com.guseoh.csforge.question.domain.QuestionStatus.PUBLISHED
                  and link.concept.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                  and link.concept.topic.active = true
                  and link.concept.topic.learningArea.active = true
            )
            """)
    ReviewSummaryCounts summarizeVisible(
            @Param("startOfToday") Instant startOfToday,
            @Param("now") Instant now,
            @Param("next24Hours") Instant next24Hours,
            @Param("next7Days") Instant next7Days);

    @Query("""
            select count(schedule) from ReviewSchedule schedule
            where schedule.status = :status
              and schedule.dueAt <= :until
              and exists (
                  select 1 from QuestionConcept link
                  where link.question = schedule.question
                    and link.question.status = com.guseoh.csforge.question.domain.QuestionStatus.PUBLISHED
                    and link.concept.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                    and link.concept.topic.active = true
                    and link.concept.topic.learningArea.active = true
              )
            """)
    long countScheduledDueBefore(@Param("status") ReviewScheduleStatus status, @Param("until") Instant until);

    @Query("select count(schedule) from ReviewSchedule schedule where schedule.status = :status and schedule.dueAt > :from and schedule.dueAt <= :until")
    long countScheduledDueBetweenExclusiveInclusive(
            @Param("status") ReviewScheduleStatus status,
            @Param("from") Instant from,
            @Param("until") Instant until);

    @Query("""
            select schedule.questionId from ReviewSchedule schedule
            where schedule.status = :status
              and schedule.dueAt <= :until
              and exists (
                  select 1 from QuestionConcept link
                  where link.question = schedule.question
                    and link.question.status = com.guseoh.csforge.question.domain.QuestionStatus.PUBLISHED
                    and link.concept.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                    and link.concept.topic.active = true
                    and link.concept.topic.learningArea.active = true
              )
            order by schedule.dueAt asc, schedule.questionId asc
            """)
    List<Long> findEligibleQuestionIds(
            @Param("status") ReviewScheduleStatus status,
            @Param("until") Instant until,
            Pageable pageable);
}
