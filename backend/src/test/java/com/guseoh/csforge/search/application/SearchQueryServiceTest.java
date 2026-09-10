package com.guseoh.csforge.search.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/** PostgreSQL Search 조회 경계와 입력 검증의 application 계약을 검증한다. */
@ExtendWith(MockitoExtension.class)
class SearchQueryServiceTest {

    @Mock
    SearchQueryGateway searchQueryGateway;

    @Mock
    SearchFilterOptionsProvider filterOptionsProvider;

    private SearchQueryService service;

    @BeforeEach
    void setUp() {
        service = new SearchQueryService(searchQueryGateway, filterOptionsProvider);
    }

    @Test
    void statusReportsCurrentPostgresqlDocumentCount() {
        when(searchQueryGateway.countSearchableDocuments()).thenReturn(12L);

        SearchStatusView status = service.status();

        assertEquals(12L, status.searchableDocuments());
    }

    @Test
    void blankSuggestionDoesNotTouchTheQueryBoundary() {
        assertEquals(List.of(), service.suggest("   ", 8));
        verify(searchQueryGateway, never()).suggest("", 8);
    }

    @Test
    void suggestionTrimsQueryAndEnforcesBoundedSize() {
        when(searchQueryGateway.suggest("HashMap", 10)).thenReturn(List.of());

        assertEquals(List.of(), service.suggest("  HashMap  ", 10));
        verify(searchQueryGateway).suggest("HashMap", 10);
        assertThrows(IllegalArgumentException.class, () -> service.suggest("HashMap", 11));
        assertThrows(IllegalArgumentException.class, () -> service.suggest("x".repeat(101), 8));
    }
}
