package com.guseoh.csforge.dashboard.infrastructure;

import java.time.Instant;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/** bounded JPA aggregate queries; no per-Concept query for Dashboard insights. */
@Repository
@RequiredArgsConstructor
public class LearningInsightsQueryRepository {

    private final EntityManager entityManager;

    public Tuple attemptSummary(Instant from, Instant until, String areaSlug) {
        return entityManager.createQuery("""
                select count(case when a.gradingStatus in (
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED) then 1 end) as finalizedCount,
                       count(case when a.gradingStatus in (
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                          and a.correct = true then 1 end) as correctCount,
                       count(case when a.gradingStatus in (
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                          and a.correct = false then 1 end) as wrongCount,
                       count(distinct case when a.gradingStatus in (
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                          then a.question.id end) as questionCount,
                       count(case when a.gradingStatus =
                          com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECK_REQUIRED then 1 end) as pendingCount
                from Attempt a
                where a.gradedAt >= :from and a.gradedAt < :until
                  and a.answeredAt is not null
                  and a.quizSession.status <> com.guseoh.csforge.quiz.domain.QuizSessionStatus.IN_PROGRESS
                  and (:area is null or exists (
                      select 1 from QuestionConcept qc
                      where qc.question = a.question
                        and qc.concept.topic.learningArea.slug = :area))
                """, Tuple.class)
                .setParameter("from", from)
                .setParameter("until", until)
                .setParameter("area", areaSlug)
                .getSingleResult();
    }

    public long viewedConcepts(Instant from, Instant until, String areaSlug) {
        return entityManager.createQuery("""
                select count(distinct h.concept.id)
                from ConceptViewHistory h
                where h.viewedAt >= :from and h.viewedAt < :until
                  and (:area is null or h.concept.topic.learningArea.slug = :area)
                """, Long.class)
                .setParameter("from", from)
                .setParameter("until", until)
                .setParameter("area", areaSlug)
                .getSingleResult();
    }

    public Tuple reviewDue(Instant asOf, Instant startOfToday, String areaSlug) {
        return entityManager.createQuery("""
                select count(case when s.dueAt < :today then 1 end) as overdue,
                       count(case when s.dueAt >= :today then 1 end) as today
                from ReviewSchedule s
                where s.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED
                  and s.dueAt <= :asOf
                  and (:area is null or exists (
                      select 1 from QuestionConcept qc
                      where qc.question = s.question
                        and qc.concept.topic.learningArea.slug = :area))
                """, Tuple.class)
                .setParameter("today", startOfToday)
                .setParameter("asOf", asOf)
                .setParameter("area", areaSlug)
                .getSingleResult();
    }

    public List<Tuple> weakCandidates(Instant from, Instant until, String areaSlug, int limit) {
        return entityManager.createQuery("""
                select c.id as conceptId, c.title as title,
                       area.slug as areaSlug, area.name as areaName,
                       count(a.id) as wrongAttempts, max(a.gradedAt) as lastWrongAt
                from Attempt a
                join QuestionConcept qc on qc.question = a.question
                join qc.concept c
                join c.topic topic
                join topic.learningArea area
                where a.correct = false
                  and a.gradingStatus in (
                    com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                    com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                  and a.answeredAt is not null
                  and a.quizSession.status <> com.guseoh.csforge.quiz.domain.QuizSessionStatus.IN_PROGRESS
                  and a.gradedAt >= :from and a.gradedAt < :until
                  and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                  and topic.active = true and area.active = true
                  and (:area is null or area.slug = :area)
                group by c.id, c.title, area.slug, area.name
                order by count(a.id) desc, max(a.gradedAt) desc, c.id asc
                """, Tuple.class)
                .setParameter("from", from)
                .setParameter("until", until)
                .setParameter("area", areaSlug)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<Tuple> dueByConcept(List<Long> conceptIds, Instant asOf) {
        if (conceptIds.isEmpty()) return List.of();
        return entityManager.createQuery("""
                select qc.concept.id as conceptId, count(distinct s.questionId) as due
                from ReviewSchedule s
                join QuestionConcept qc on qc.question = s.question
                where qc.concept.id in :ids
                  and s.status = com.guseoh.csforge.review.domain.ReviewScheduleStatus.SCHEDULED
                  and s.dueAt <= :asOf
                group by qc.concept.id
                """, Tuple.class)
                .setParameter("ids", conceptIds)
                .setParameter("asOf", asOf)
                .getResultList();
    }
}
