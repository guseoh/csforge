package com.guseoh.csforge.search.application;

import java.util.Map;

/** 완료된 full reindex의 physical index와 outbox 경계 및 실제 문서 수를 반환한다. */
public record SearchReindexResult(
        String physicalIndex,
        long baselineOutboxId,
        long highWaterOutboxId,
        Map<SearchDocumentType, Long> indexedCounts) {

    public SearchReindexResult {
        if (physicalIndex == null || physicalIndex.isBlank() || baselineOutboxId < 0 || highWaterOutboxId < baselineOutboxId
                || indexedCounts == null) {
            throw new IllegalArgumentException("Invalid search reindex result");
        }
        indexedCounts = Map.copyOf(indexedCounts);
    }

    public long totalIndexedCount() {
        return indexedCounts.values().stream().mapToLong(Long::longValue).sum();
    }
}
