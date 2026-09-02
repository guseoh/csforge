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

    @Query("select coalesce(max(e.id), 0) from SearchOutboxEvent e")
    long findMaxId();

    @Query("""
            select e from SearchOutboxEvent e
            where e.id > :afterId and e.id <= :throughId
            order by e.id
            """)
    List<SearchOutboxEvent> findBetweenIds(
            @Param("afterId") long afterId,
            @Param("throughId") long throughId,
            Pageable pageable);

    long countByPublishedAtIsNull();
}
