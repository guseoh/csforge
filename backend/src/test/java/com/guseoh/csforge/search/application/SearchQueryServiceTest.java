package com.guseoh.csforge.search.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** Search query/suggestion과 infrastructure 복구 상태의 application 계약을 검증한다. */
@ExtendWith(MockitoExtension.class)
class SearchQueryServiceTest {

    @Mock
    SearchEngineGateway searchEngineGateway;

    @Mock
    SearchFilterOptionsProvider filterOptionsProvider;

    @Mock
    SearchOutboxEventRepository outboxRepository;

    @Mock
    SearchReindexState reindexState;

    private SearchQueryService service;

    @BeforeEach
    void setUp() {
        service = new SearchQueryService(
                searchEngineGateway,
                filterOptionsProvider,
                outboxRepository,
                reindexState);
    }

    @Test
    void unavailableInfrastructureProducesRecoverableUnavailableStatusWithoutCountingDocuments() {
        when(searchEngineGateway.state()).thenReturn(SearchEngineState.UNAVAILABLE);
        when(outboxRepository.countByPublishedAtIsNull()).thenReturn(3L);

        SearchStatusView status = service.status();

        assertEquals(SearchProductState.UNAVAILABLE, status.state());
        assertEquals(0, status.indexedDocuments());
        assertEquals(3, status.pendingOutboxEvents());
        verify(searchEngineGateway, never()).countDocuments();
    }

    @Test
    void activeReindexTakesProductStatePrecedenceOverReadyIndex() {
        when(searchEngineGateway.state()).thenReturn(SearchEngineState.READY);
        when(reindexState.isReindexing()).thenReturn(true);
        when(searchEngineGateway.countDocuments()).thenReturn(12L);
        when(outboxRepository.countByPublishedAtIsNull()).thenReturn(2L);

        SearchStatusView status = service.status();

        assertEquals(SearchProductState.REINDEXING, status.state());
        assertEquals(12, status.indexedDocuments());
        assertEquals(2, status.pendingOutboxEvents());
    }

    @Test
    void missingIndexRejectsSearchAsNotReadyInsteadOfCallingSearchEngine() {
        when(searchEngineGateway.state()).thenReturn(SearchEngineState.NOT_READY);
        SearchCriteria criteria = new SearchCriteria(
                "HashMap",
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                SearchSort.RELEVANCE,
                0,
                20);

        assertThrows(SearchNotReadyException.class, () -> service.search(criteria));
        verify(searchEngineGateway, never()).search(criteria);
    }

    @Test
    void blankSuggestionDoesNotTouchSearchInfrastructure() {
        assertEquals(List.of(), service.suggest("   ", 8));
        verify(searchEngineGateway, never()).state();
        verify(searchEngineGateway, never()).suggest("", 8);
    }

    @Test
    void readySuggestionTrimsQueryAndEnforcesBoundedSize() {
        when(searchEngineGateway.state()).thenReturn(SearchEngineState.READY);
        when(searchEngineGateway.suggest("HashMap", 10)).thenReturn(List.of());

        assertEquals(List.of(), service.suggest("  HashMap  ", 10));
        verify(searchEngineGateway).suggest("HashMap", 10);
        assertThrows(IllegalArgumentException.class, () -> service.suggest("HashMap", 11));
        assertThrows(IllegalArgumentException.class, () -> service.suggest("x".repeat(101), 8));
    }
}
