package com.guseoh.csforge.search.infrastructure;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 동일 source의 미발행 변경을 하나의 outbox 행으로 합쳐 기록한다. */
@Component
@RequiredArgsConstructor
public class SearchOutboxChangeRecorder implements SearchProjectionChangeRecorder {

    private final SearchOutboxEventRepository repository;
    private final Clock clock;

    @Override
    public void record(SearchChangeType changeType, long sourceId) {
        Instant now = Instant.now(clock);
        SearchOutboxEvent event = repository
                .findByChangeTypeAndSourceIdAndPublishedAtIsNull(changeType, sourceId)
                .orElseGet(() -> SearchOutboxEvent.pending(changeType, sourceId, now));
        if (event.getId() != null) event.refresh(now);
        repository.save(event);
    }
}
