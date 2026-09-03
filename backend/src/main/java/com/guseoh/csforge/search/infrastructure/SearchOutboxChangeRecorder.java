package com.guseoh.csforge.search.infrastructure;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** 동일 source의 미발행 변경을 한 행으로 합치고 전역 change sequence만 전진시킨다. */
@Component
@RequiredArgsConstructor
public class SearchOutboxChangeRecorder implements SearchProjectionChangeRecorder {

    private final SearchOutboxEventRepository repository;
    private final Clock clock;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void record(SearchChangeType changeType, long sourceId) {
        repository.lockSource(changeType.name() + ":" + sourceId);
        Instant now = Instant.now(clock);
        long changeSequence = repository.nextChangeSequence();
        repository.findByChangeTypeAndSourceIdAndPublishedAtIsNull(changeType, sourceId)
                .ifPresentOrElse(
                        existing -> existing.refresh(now, changeSequence),
                        () -> repository.save(SearchOutboxEvent.pending(changeType, sourceId, now, changeSequence)));
    }
}
