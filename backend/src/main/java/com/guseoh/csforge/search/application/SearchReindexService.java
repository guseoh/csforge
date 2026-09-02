package com.guseoh.csforge.search.application;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/** PostgreSQL full projection, outbox catch-up, Kafka quiesce와 atomic alias swap을 조정한다. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchReindexService {

    private static final int PROJECTION_BATCH_SIZE = 500;
    private static final int CATCH_UP_BATCH_SIZE = 500;

    private final SearchOutboxEventRepository outboxRepository;
    private final SearchProjectionBatchLoader batchLoader;
    private final SearchReindexProjectionUpdater catchUpUpdater;
    private final SearchReindexIndexStore indexStore;
    private final SearchIndexListenerControl listenerControl;
    private final SearchReindexState reindexState;

    public SearchReindexResult reindex() {
        if (!reindexState.tryStart()) throw new SearchReindexInProgressException();

        String physicalIndex = null;
        boolean aliasSwapped = false;
        boolean ownedListenerPause = false;
        try {
            long baselineOutboxId = outboxRepository.findMaxId();
            physicalIndex = indexStore.createPhysicalIndex();
            buildFullProjection(physicalIndex);

            ownedListenerPause = listenerControl.pauseAndAwait();
            long highWaterOutboxId = outboxRepository.findMaxId();
            replayCatchUp(physicalIndex, baselineOutboxId, highWaterOutboxId);

            indexStore.refresh(physicalIndex);
            Map<SearchDocumentType, Long> indexedCounts = indexStore.countByDocumentType(physicalIndex);
            indexStore.swapAlias(physicalIndex);
            aliasSwapped = true;

            if (ownedListenerPause) {
                listenerControl.resume();
                ownedListenerPause = false;
            }
            return new SearchReindexResult(physicalIndex, baselineOutboxId, highWaterOutboxId, indexedCounts);
        } catch (RuntimeException exception) {
            if (!aliasSwapped && physicalIndex != null) deleteFailedTarget(physicalIndex);
            throw exception;
        } finally {
            if (ownedListenerPause) resumeListenerBestEffort();
            reindexState.finish();
        }
    }

    private void buildFullProjection(String physicalIndex) {
        for (SearchDocumentType documentType : SearchDocumentType.values()) {
            long afterSourceId = 0;
            while (true) {
                SearchProjectionBatch batch = batchLoader.loadAfter(documentType, afterSourceId, PROJECTION_BATCH_SIZE);
                if (batch.isEmpty()) break;
                indexStore.bulkUpsert(physicalIndex, batch.documents());
                afterSourceId = batch.nextAfterSourceId();
            }
        }
    }

    private void replayCatchUp(String physicalIndex, long baselineOutboxId, long highWaterOutboxId) {
        long cursor = baselineOutboxId;
        while (cursor < highWaterOutboxId) {
            List<SearchOutboxEvent> events = outboxRepository.findBetweenIds(
                    cursor,
                    highWaterOutboxId,
                    PageRequest.of(0, CATCH_UP_BATCH_SIZE));
            if (events.isEmpty()) break;

            Map<SearchChangeKey, SearchOutboxEvent> latestBySource = new LinkedHashMap<>();
            for (SearchOutboxEvent event : events) {
                latestBySource.put(new SearchChangeKey(event.getChangeType(), event.getSourceId()), event);
            }
            for (SearchOutboxEvent event : latestBySource.values()) {
                catchUpUpdater.apply(physicalIndex, event.getChangeType(), event.getSourceId());
            }
            cursor = events.getLast().getId();
        }
    }

    private void deleteFailedTarget(String physicalIndex) {
        try {
            indexStore.deleteIndex(physicalIndex);
        } catch (RuntimeException cleanupFailure) {
            log.warn("Failed to clean unsuccessful Search reindex target index={}", physicalIndex, cleanupFailure);
        }
    }

    private void resumeListenerBestEffort() {
        try {
            listenerControl.resume();
        } catch (RuntimeException resumeFailure) {
            log.error("Failed to resume Search Kafka listener after reindex", resumeFailure);
        }
    }

    private record SearchChangeKey(SearchChangeType changeType, long sourceId) { }
}
