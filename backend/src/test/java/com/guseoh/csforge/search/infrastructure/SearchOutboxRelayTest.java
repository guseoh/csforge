package com.guseoh.csforge.search.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionStore;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

/** Search outbox가 broker ack 전에는 발행 완료되지 않고 실패 시 retry 상태를 유지하는지 검증한다. */
@ExtendWith(MockitoExtension.class)
class SearchOutboxRelayTest {

    private static final Instant NOW = Instant.parse("2026-09-03T05:00:00Z");

    @Mock
    SearchOutboxEventRepository repository;

    @Mock
    SearchProjectionStore projectionStore;

    @Mock
    KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    SendResult<String, String> sendResult;

    private SearchOutboxRelay relay;

    @BeforeEach
    void setUp() {
        relay = new SearchOutboxRelay(
                repository,
                projectionStore,
                kafkaTemplate,
                new SearchIndexEventCodec(),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void brokerFailureLeavesEventPendingAndSchedulesRetry() {
        SearchOutboxEvent event = SearchOutboxEvent.pending(SearchChangeType.CONCEPT, 42L, NOW.minusSeconds(5), 7L);
        CompletableFuture<SendResult<String, String>> failed = new CompletableFuture<>();
        failed.completeExceptionally(new IllegalStateException("broker unavailable"));
        when(projectionStore.isReady()).thenReturn(true);
        when(repository.findDuePending(any(), any(Pageable.class))).thenReturn(List.of(event));
        when(kafkaTemplate.send(SearchKafkaConfiguration.INDEX_TOPIC, "CONCEPT:42", new SearchIndexEventCodec().encode(
                new com.guseoh.csforge.search.application.SearchIndexEvent(
                        com.guseoh.csforge.search.application.SearchIndexEvent.CURRENT_SCHEMA_VERSION,
                        event.getEventId(),
                        event.getChangeType(),
                        event.getSourceId(),
                        event.getUpdatedAt())))).thenReturn(failed);

        relay.relay();

        assertNull(event.getPublishedAt());
        assertEquals(1, event.getAttemptCount());
        assertEquals(NOW.plusSeconds(1), event.getNextAttemptAt());
        assertTrue(event.getLastError().contains("broker unavailable"));
    }

    @Test
    void brokerAcknowledgementMarksEventPublished() {
        SearchOutboxEvent event = SearchOutboxEvent.pending(SearchChangeType.PERSONAL_NOTE, 9L, NOW.minusSeconds(2), 8L);
        when(projectionStore.isReady()).thenReturn(true);
        when(repository.findDuePending(any(), any(Pageable.class))).thenReturn(List.of(event));
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(CompletableFuture.completedFuture(sendResult));

        relay.relay();

        assertEquals(NOW, event.getPublishedAt());
        assertEquals(0, event.getAttemptCount());
        assertNull(event.getNextAttemptAt());
        assertNull(event.getLastError());
    }
}
