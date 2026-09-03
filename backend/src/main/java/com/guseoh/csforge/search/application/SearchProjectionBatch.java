package com.guseoh.csforge.search.application;

import java.util.List;

/** full reindex가 한 번에 읽은 stable keyset batch와 다음 source cursor를 표현한다. */
public record SearchProjectionBatch(
        long nextAfterSourceId,
        int scannedCount,
        List<SearchProjectionDocument> documents) {

    public SearchProjectionBatch {
        if (nextAfterSourceId < 0 || scannedCount < 0 || documents == null) {
            throw new IllegalArgumentException("Invalid search projection batch");
        }
        documents = List.copyOf(documents);
    }

    public boolean isEmpty() {
        return scannedCount == 0;
    }
}
