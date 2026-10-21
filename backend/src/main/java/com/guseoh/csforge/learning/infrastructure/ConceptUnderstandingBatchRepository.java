package com.guseoh.csforge.learning.infrastructure;

import java.util.List;

import com.guseoh.csforge.quiz.domain.Attempt;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

/** PostgreSQL window function으로 여러 Concept의 최근 10개 서로 다른 문제를 한 번에 집계한다. */
public interface ConceptUnderstandingBatchRepository extends Repository<Attempt, Long> {

    @Query(value = """
            with relevant as (
                select qc.concept_id, a.id as attempt_id, a.question_id,
                       a.correct, a.grading_status, a.graded_at
                from question_concept qc
                join attempt a on a.question_id = qc.question_id
                join quiz_session s on s.id = a.quiz_session_id
                where qc.concept_id in (:conceptIds)
                  and s.status in ('SUBMITTED', 'COMPLETED')
                  and a.grading_status in ('GRADED', 'SELF_CHECKED', 'SELF_CHECK_REQUIRED')
            ),
            totals as (
                select concept_id,
                       count(*) filter (where grading_status in ('GRADED', 'SELF_CHECKED')) as finalized_attempts,
                       count(*) filter (where grading_status = 'SELF_CHECK_REQUIRED') as pending_self_check
                from relevant
                group by concept_id
            ),
            latest as (
                select concept_id, attempt_id, question_id, correct, graded_at,
                       row_number() over (
                         partition by concept_id, question_id
                         order by graded_at desc, attempt_id desc
                       ) as question_rank
                from relevant
                where grading_status in ('GRADED', 'SELF_CHECKED')
            ),
            recent as (
                select concept_id, correct, graded_at,
                       row_number() over (
                         partition by concept_id
                         order by graded_at desc, attempt_id desc
                       ) as recent_rank
                from latest
                where question_rank = 1
            ),
            sampled as (
                select concept_id,
                       count(*) as unique_questions,
                       count(*) filter (where correct = true) as correct_questions,
                       max(graded_at) as last_assessed_at
                from recent
                where recent_rank <= 10
                group by concept_id
            )
            select t.concept_id, t.finalized_attempts, t.pending_self_check,
                   coalesce(s.unique_questions, 0), coalesce(s.correct_questions, 0), s.last_assessed_at
            from totals t
            left join sampled s on s.concept_id = t.concept_id
            order by t.concept_id
            """, nativeQuery = true)
    List<Object[]> summarizeConceptIds(@Param("conceptIds") List<Long> conceptIds);
}
