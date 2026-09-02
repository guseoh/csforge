package com.guseoh.csforge.search.infrastructure;

import java.util.concurrent.atomic.AtomicBoolean;

import com.guseoh.csforge.search.application.SearchReindexState;
import org.springframework.stereotype.Component;

/** single-process V1에서 동시 reindex를 막고 Search status에 진행 상태를 공유한다. */
@Component
public class InMemorySearchReindexState implements SearchReindexState {

    private final AtomicBoolean reindexing = new AtomicBoolean(false);

    @Override
    public boolean isReindexing() {
        return reindexing.get();
    }

    public boolean start() {
        return reindexing.compareAndSet(false, true);
    }

    public void finish() {
        reindexing.set(false);
    }
}
