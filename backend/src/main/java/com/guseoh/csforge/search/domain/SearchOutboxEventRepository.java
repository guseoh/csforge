package com.guseoh.csforge.search.domain;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.guseoh.csforge.search.application.SearchChangeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

/** 검색 outbox의 pending/coalescing/replay 조회를 제공하는 JPA 저장소이다. */
public interface SearchOutboxEventRepository extends JpaRepository<SearchOutboxEvent, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<SearchOutboxEvent> findByChangeTypeAndSourceIdAndPublishedAtIsNull(
            SearchChangeType changeType,
            long sourceId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select e from SearchOutboxEvent e
            where e.publishedAt is null
              and (e.nextAttemptAt is null or e.nextAttemptAt <= :now)
            order by e.id
            """)
    List<SearchOutboxEvent> findDuePending(@Param("now") Instant now, Pageable pageable);

    @Query(value = "select nextval('search_outbox_change_sequence_seq')", nativeQuery = true)
    long nextChangeSequence();

    @Query("select coalesce(max(e.changeSequence), 0) from SearchOutboxEvent e")
    long findMaxChangeSequence();

    @Query("""
            select e from SearchOutboxEvent e
            where e.changeSequence > :afterSequence and e.changeSequence <= :throughSequence
            order by e.changeSequence, e.id
            """)
    List<SearchOutboxEvent> findBetweenChangeSequences(
            @Param("afterSequence") long afterSequence,
            @Param("throughSequence") long throughSequence,
            Pageable pageable);

    long countByPublishedAtIsNull();
}
