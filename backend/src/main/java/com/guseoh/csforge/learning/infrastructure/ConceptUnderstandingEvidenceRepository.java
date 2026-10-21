package com.guseoh.csforge.learning.infrastructure;

import java.util.List;

import com.guseoh.csforge.learning.application.ConceptUnderstandingCount;
import com.guseoh.csforge.learning.application.ConceptUnderstandingEvidence;
import com.guseoh.csforge.quiz.domain.Attempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/** 연결된 Question의 확정 채점 근거를 bounded projection으로 조회한다. */
public interface ConceptUnderstandingEvidenceRepository extends Repository<Attempt, Long> {

    @Query("""
            select new com.guseoh.csforge.learning.application.ConceptUnderstandingCount(a.gradingStatus, count(a))
            from Attempt a, QuestionConcept link
            where link.question.id = a.question.id
              and link.concept.id = :conceptId
              and a.quizSession.status <> com.guseoh.csforge.quiz.domain.QuizSessionStatus.IN_PROGRESS
              and a.gradingStatus in (
                com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED,
                com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECK_REQUIRED)
            group by a.gradingStatus
            """)
    List<ConceptUnderstandingCount> countByGradingStatus(@Param("conceptId") long conceptId);

    @Query("""
            select new com.guseoh.csforge.learning.application.ConceptUnderstandingEvidence(
                a.question.id, a.correct, a.gradedAt, a.id)
            from Attempt a, QuestionConcept link
            where link.question.id = a.question.id
              and link.concept.id = :conceptId
              and a.quizSession.status <> com.guseoh.csforge.quiz.domain.QuizSessionStatus.IN_PROGRESS
              and a.gradingStatus in (
                com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
              and not exists (
                  select newer.id
                  from Attempt newer
                  where newer.question.id = a.question.id
                    and newer.quizSession.status <> com.guseoh.csforge.quiz.domain.QuizSessionStatus.IN_PROGRESS
                    and newer.gradingStatus in (
                      com.guseoh.csforge.quiz.domain.AttemptGradingStatus.GRADED,
                      com.guseoh.csforge.quiz.domain.AttemptGradingStatus.SELF_CHECKED)
                    and (
                      newer.gradedAt > a.gradedAt
                      or (newer.gradedAt = a.gradedAt and newer.id > a.id)
                    )
              )
            order by a.gradedAt desc, a.id desc
            """)
    List<ConceptUnderstandingEvidence> findLatestFinalizedDistinctQuestions(
            @Param("conceptId") long conceptId, Pageable pageable);
}
