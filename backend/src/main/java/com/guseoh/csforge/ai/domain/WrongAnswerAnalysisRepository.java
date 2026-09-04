package com.guseoh.csforge.ai.domain;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

/** 오답 분석 lifecycle row의 저장과 durable work 조회를 담당한다. */
public interface WrongAnswerAnalysisRepository extends JpaRepository<WrongAnswerAnalysis, Long> {

    Optional<WrongAnswerAnalysis> findByAttemptId(long attemptId);

    @Query("select analysis.attempt.id as attemptId, analysis.status as status from WrongAnswerAnalysis analysis where analysis.attempt.id in :attemptIds")
    List<WrongAnswerAnalysisStatusProjection> findStatusesByAttemptIdIn(@Param("attemptIds") Collection<Long> attemptIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select analysis from WrongAnswerAnalysis analysis where analysis.id = :id")
    Optional<WrongAnswerAnalysis> findByIdForUpdate(@Param("id") long id);

    @Query("""
            select analysis.id
            from WrongAnswerAnalysis analysis
            where (analysis.status = :pending
                   and (analysis.nextAttemptAt is null or analysis.nextAttemptAt <= :now))
               or (analysis.status = :processing and analysis.startedAt <= :staleBefore)
            order by analysis.requestedAt asc, analysis.id asc
            """)
    List<Long> findRunnableIds(
            @Param("pending") WrongAnswerAnalysisStatus pending,
            @Param("processing") WrongAnswerAnalysisStatus processing,
            @Param("now") Instant now,
            @Param("staleBefore") Instant staleBefore,
            Pageable pageable);
}
