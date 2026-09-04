package com.guseoh.csforge.dashboard.infrastructure;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/** Dashboard read model에 필요한 bounded JPA projection을 조회한다. */
@Repository
@RequiredArgsConstructor
public class DashboardQueryRepository {

    private final EntityManager entityManager;

    public List<DashboardAreaProgressProjection> findAreaProgress() {
        return entityManager.createQuery("""
                        select la.slug as areaSlug,
                               la.name as areaName,
                               count(c.id) as publishedConceptCount,
                               count(case when cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end) as completedConceptCount,
                               count(case when c.level = 1 then 1 end) as level1Total,
                               count(case when c.level = 1 and cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end) as level1Completed,
                               count(case when c.level = 2 then 1 end) as level2Total,
                               count(case when c.level = 2 and cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end) as level2Completed,
                               count(case when c.level = 3 then 1 end) as level3Total,
                               count(case when c.level = 3 and cp.status = com.guseoh.csforge.learning.domain.LearningStatus.COMPLETED then 1 end) as level3Completed
                        from LearningArea la
                        left join Topic t on t.learningArea = la and t.active = true
                        left join Concept c on c.topic = t
                            and c.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                        left join ConceptProgress cp on cp.concept = c
                        where la.active = true
                        group by la.id, la.slug, la.name, la.displayOrder
                        order by la.displayOrder, la.id
                        """, Tuple.class)
                .getResultList().stream()
                .map(row -> new DashboardAreaProgressProjection(
                        row.get("areaSlug", String.class),
                        row.get("areaName", String.class),
                        count(row, "completedConceptCount"),
                        count(row, "publishedConceptCount"),
                        count(row, "level1Total"),
                        count(row, "level1Completed"),
                        count(row, "level2Total"),
                        count(row, "level2Completed"),
                        count(row, "level3Total"),
                        count(row, "level3Completed")))
                .toList();
    }

    public List<DashboardConceptViewProjection> findConceptViews(Instant from, Instant until) {
        return entityManager.createQuery("""
                        select history.concept.id as conceptId, history.viewedAt as viewedAt
                        from ConceptViewHistory history
                        where history.viewedAt >= :from and history.viewedAt < :until
                        order by history.viewedAt asc, history.id asc
                        """, Tuple.class)
                .setParameter("from", from)
                .setParameter("until", until)
                .getResultList().stream()
                .map(row -> new DashboardConceptViewProjection(
                        row.get("conceptId", Long.class),
                        row.get("viewedAt", Instant.class)))
                .toList();
    }

    public List<DashboardAttemptActivityProjection> findFinalizedAttempts(Instant from, Instant until) {
        return entityManager.createQuery("""
                        select attempt.id as attemptId,
                               attempt.correct as correct,
                               attempt.gradedAt as gradedAt
                        from Attempt attempt
                        where attempt.gradingStatus in (
                            com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                            com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                          and attempt.gradedAt >= :from
                          and attempt.gradedAt < :until
                        order by attempt.gradedAt asc, attempt.id asc
                        """, Tuple.class)
                .setParameter("from", from)
                .setParameter("until", until)
                .getResultList().stream()
                .map(row -> new DashboardAttemptActivityProjection(
                        row.get("attemptId", Long.class),
                        row.get("correct", Boolean.class),
                        row.get("gradedAt", Instant.class)))
                .toList();
    }

    public List<DashboardWeakTopicProjection> findWeakTopicEvidence(Instant from, Instant until) {
        return entityManager.createQuery("""
                        select attempt.id as attemptId,
                               attempt.correct as correct,
                               topic.id as topicId,
                               topic.contentKey as topicContentKey,
                               topic.title as topicTitle,
                               area.slug as areaSlug,
                               area.name as areaName
                        from Attempt attempt
                        join attempt.question question
                        join QuestionConcept link on link.question = question
                        join link.concept concept
                        join concept.topic topic
                        join topic.learningArea area
                        where attempt.gradingStatus in (
                            com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                            com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                          and attempt.gradedAt >= :from
                          and attempt.gradedAt <= :until
                          and question.status = com.guseoh.csforge.question.domain.QuestionStatus.PUBLISHED
                          and concept.status = com.guseoh.csforge.learning.domain.ContentStatus.PUBLISHED
                          and topic.active = true
                          and area.active = true
                        order by attempt.id asc, topic.id asc
                        """, Tuple.class)
                .setParameter("from", from)
                .setParameter("until", until)
                .getResultList().stream()
                .map(row -> new DashboardWeakTopicProjection(
                        row.get("attemptId", Long.class),
                        row.get("correct", Boolean.class),
                        row.get("topicId", Long.class),
                        row.get("topicContentKey", String.class),
                        row.get("topicTitle", String.class),
                        row.get("areaSlug", String.class),
                        row.get("areaName", String.class)))
                .toList();
    }

    public List<DashboardQuizAttemptAggregateProjection> findQuizAttemptAggregates(Collection<Long> quizIds) {
        if (quizIds.isEmpty()) return List.of();
        return entityManager.createQuery("""
                        select attempt.quizSession.id as quizId,
                               count(attempt.id) as attemptCount,
                               count(case when attempt.gradingStatus in (
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED) then 1 end) as finalizedCount,
                               count(case when attempt.gradingStatus in (
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                                   and attempt.correct = true then 1 end) as correctCount,
                               count(case when attempt.gradingStatus in (
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                                   and attempt.correct = false then 1 end) as wrongCount,
                               count(case when attempt.gradingStatus =
                                   com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECK_REQUIRED then 1 end) as pendingSelfCheckCount
                        from Attempt attempt
                        where attempt.quizSession.id in :quizIds
                        group by attempt.quizSession.id
                        """, Tuple.class)
                .setParameter("quizIds", quizIds)
                .getResultList().stream()
                .map(row -> new DashboardQuizAttemptAggregateProjection(
                        row.get("quizId", Long.class),
                        count(row, "attemptCount"),
                        count(row, "finalizedCount"),
                        count(row, "correctCount"),
                        count(row, "wrongCount"),
                        count(row, "pendingSelfCheckCount")))
                .toList();
    }

    public List<DashboardQuizQuestionCountProjection> findQuizQuestionCounts(Collection<Long> quizIds) {
        if (quizIds.isEmpty()) return List.of();
        return entityManager.createQuery("""
                        select quizQuestion.quizSession.id as quizId, count(quizQuestion.id) as questionCount
                        from QuizQuestion quizQuestion
                        where quizQuestion.quizSession.id in :quizIds
                        group by quizQuestion.quizSession.id
                        """, Tuple.class)
                .setParameter("quizIds", quizIds)
                .getResultList().stream()
                .map(row -> new DashboardQuizQuestionCountProjection(
                        row.get("quizId", Long.class),
                        count(row, "questionCount")))
                .toList();
    }

    private static long count(Tuple row, String alias) {
        return row.get(alias, Long.class);
    }
}
