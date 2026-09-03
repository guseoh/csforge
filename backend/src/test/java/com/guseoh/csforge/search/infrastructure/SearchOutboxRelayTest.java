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
import java.util.Optional;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

/** Search outbox가 broker ack 전에는 발행 완료되지 않고 concurrent 최신 변경을 덮어쓰지 않는지 검증한다. */
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

    @Mock
    PlatformTransactionManager transactionManager;

    @Mock
    TransactionStatus transactionStatus;

    private SearchOutboxRelay relay;

    @BeforeEach
    void setUp() {
        when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        relay = new SearchOutboxRelay(
                repository,
                projectionStore,
                kafkaTemplate,
                new SearchIndexEventCodec(),
                Clock.fixed(NOW, ZoneOffset.UTC),
                transactionManager);
    }

    @Test
    void brokerFailureLeavesCurrentEventPendingAndSchedulesRetry() {
        SearchOutboxEvent event = pending(1L, SearchChangeType.CONCEPT, 42L, NOW.minusSeconds(5), 7L);
        CompletableFuture<SendResult<String, String>> failed = new CompletableFuture<>();
        failed.completeExceptionally(new IllegalStateException("broker unavailable"));
        when(projectionStore.isReady()).thenReturn(true);
        when(repository.findDuePending(any(), any(Pageable.class))).thenReturn(List.of(event));
        when(repository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(failed);

        relay.relay();

        assertNull(event.getPublishedAt());
        assertEquals(1, event.getAttemptCount());
        assertEquals(NOW.plusSeconds(1), event.getNextAttemptAt());
        assertTrue(event.getLastError().contains("broker unavailable"));
    }

    @Test
    void brokerAcknowledgementMarksCurrentEventPublished() {
        SearchOutboxEvent event = pending(2L, SearchChangeType.PERSONAL_NOTE, 9L, NOW.minusSeconds(2), 8L);
        when(projectionStore.isReady()).thenReturn(true);
        when(repository.findDuePending(any(), any(Pageable.class))).thenReturn(List.of(event));
        when(repository.findByIdForUpdate(2L)).thenReturn(Optional.of(event));
        when(kafkaTemplate.send(any(), any(), any())).thenReturn(CompletableFuture.completedFuture(sendResult));

        relay.relay();

        assertEquals(NOW, event.getPublishedAt());
        assertEquals(0, event.getAttemptCount());
        assertNull(event.getNextAttemptAt());
        assertNull(event.getLastError());
    }

    @Test
    void brokerAcknowledgementDoesNotPublishNewerCoalescedChange() {
        SearchOutboxEvent event = pending(3L, SearchChangeType.CONCEPT, 77L, NOW.minusSeconds(3), 10L);
        when(projectionStore.isReady()).thenReturn(true);
        when(repository.findDuePending(any(), any(Pageable.class))).thenReturn(List.of(event));
        when(repository.findByIdForUpdate(3L)).thenReturn(Optional.of(event));
        when(kafkaTemplate.send(any(), any(), any())).thenAnswer(invocation -> {
            event.refresh(NOW, 11L);
            return CompletableFuture.completedFuture(sendResult);
        });

        relay.relay();

        assertNull(event.getPublishedAt());
        assertEquals(11L, event.getChangeSequence());
        assertNull(event.getNextAttemptAt());
    }

    private static SearchOutboxEvent pending(
            long id,
            SearchChangeType changeType,
            long sourceId,
            Instant occurredAt,
            long changeSequence) {
        SearchOutboxEvent event = SearchOutboxEvent.pending(changeType, sourceId, occurredAt, changeSequence);
        ReflectionTestUtils.setField(event, "id", id);
        return event;
    }
}
