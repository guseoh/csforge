package com.guseoh.csforge.search.application;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import com.guseoh.csforge.search.infrastructure.InMemorySearchReindexState;
import org.junit.jupiter.api.Test;

/** full reindex orchestration의 실패 안전성과 single-process 동시 실행 방지를 검증한다. */
class SearchReindexServiceTest {

    @Test
    void failureBeforeAliasSwapDeletesOnlyFailedTargetAndNeverMovesAlias() {
        SearchOutboxEventRepository outboxRepository = mock(SearchOutboxEventRepository.class);
        SearchProjectionBatchLoader batchLoader = mock(SearchProjectionBatchLoader.class);
        SearchReindexProjectionUpdater catchUpUpdater = mock(SearchReindexProjectionUpdater.class);
        SearchReindexIndexStore indexStore = mock(SearchReindexIndexStore.class);
        SearchIndexListenerControl listenerControl = mock(SearchIndexListenerControl.class);
        InMemorySearchReindexState reindexState = new InMemorySearchReindexState();
        SearchReindexService service = new SearchReindexService(
                outboxRepository,
                batchLoader,
                catchUpUpdater,
                indexStore,
                listenerControl,
                reindexState);

        when(outboxRepository.findMaxChangeSequence()).thenReturn(10L);
        when(indexStore.createPhysicalIndex()).thenReturn("csforge-search-v1-failed");
        when(batchLoader.loadAfter(any(SearchDocumentType.class), anyLong(), anyInt()))
                .thenReturn(new SearchProjectionBatch(0, 0, List.of()));
        when(listenerControl.pauseAndAwait()).thenReturn(true);
        RuntimeException failure = new RuntimeException("refresh failed");
        org.mockito.Mockito.doThrow(failure).when(indexStore).refresh("csforge-search-v1-failed");

        assertThrows(RuntimeException.class, service::reindex);

        verify(indexStore, never()).swapAlias(any());
        verify(indexStore).deleteIndex("csforge-search-v1-failed");
        verify(listenerControl).resume();
    }

    @Test
    void secondReindexIsRejectedWhileFirstExecutionOwnsState() {
        SearchOutboxEventRepository outboxRepository = mock(SearchOutboxEventRepository.class);
        SearchProjectionBatchLoader batchLoader = mock(SearchProjectionBatchLoader.class);
        SearchReindexProjectionUpdater catchUpUpdater = mock(SearchReindexProjectionUpdater.class);
        SearchReindexIndexStore indexStore = mock(SearchReindexIndexStore.class);
        SearchIndexListenerControl listenerControl = mock(SearchIndexListenerControl.class);
        InMemorySearchReindexState reindexState = new InMemorySearchReindexState();
        SearchReindexService service = new SearchReindexService(
                outboxRepository,
                batchLoader,
                catchUpUpdater,
                indexStore,
                listenerControl,
                reindexState);

        reindexState.tryStart();

        assertThrows(SearchReindexInProgressException.class, service::reindex);
        verify(indexStore, never()).createPhysicalIndex();

        reindexState.finish();
    }
}
