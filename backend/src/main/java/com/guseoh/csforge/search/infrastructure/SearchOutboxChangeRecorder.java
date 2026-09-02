package com.guseoh.csforge.search.infrastructure;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 동일 source의 미발행 변경을 한 행으로 합치되 각 변경의 outbox identity는 단조 증가시킨다. */
@Component
@RequiredArgsConstructor
public class SearchOutboxChangeRecorder implements SearchProjectionChangeRecorder {

    private final SearchOutboxEventRepository repository;
    private final Clock clock;

    @Override
    public void record(SearchChangeType changeType, long sourceId) {
        Instant now = Instant.now(clock);
        repository.findByChangeTypeAndSourceIdAndPublishedAtIsNull(changeType, sourceId)
                .ifPresent(existing -> {
                    repository.delete(existing);
                    repository.flush();
                });
        repository.save(SearchOutboxEvent.pending(changeType, sourceId, now));
    }
}
