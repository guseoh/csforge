package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import com.guseoh.csforge.search.application.SearchProjectionStore;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import com.guseoh.csforge.search.infrastructure.SearchIndexEventCodec;
import com.guseoh.csforge.search.infrastructure.SearchOutboxRelay;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 동일 Search source의 coalescing과 Kafka relay 대기 중 canonical write isolation을 검증한다. */
@Testcontainers
@SpringBootTest
class SearchOutboxConcurrencyIntegrationTest {

    private static final int CONCURRENT_WRITERS = 8;
    private static final long SOURCE_ID = 42L;

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_search_outbox_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @Autowired
    SearchProjectionChangeRecorder recorder;

    @Autowired
    SearchOutboxEventRepository repository;

    @Autowired
    PlatformTransactionManager transactionManager;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @BeforeEach
    void cleanOutbox() {
        repository.deleteAll();
    }

    @Test
    void concurrentChangesForSameSourceRemainOnePendingRowAndAdvanceSequence() throws Exception {
        runConcurrentRecordWave();
        SearchOutboxEvent afterFirstWave = onlyEvent();
        long firstSequence = afterFirstWave.getChangeSequence();

        runConcurrentRecordWave();
        SearchOutboxEvent afterSecondWave = onlyEvent();

        assertEquals(afterFirstWave.getId(), afterSecondWave.getId());
        assertEquals(afterFirstWave.getEventId(), afterSecondWave.getEventId());
        assertTrue(afterSecondWave.getChangeSequence() > firstSequence);
        assertEquals(SearchChangeType.CONCEPT, afterSecondWave.getChangeType());
        assertEquals(SOURCE_ID, afterSecondWave.getSourceId());
        assertEquals(1, repository.countByPublishedAtIsNull());
    }

    @Test
    void relayWaitingForBrokerAckDoesNotBlockNewerCanonicalOutboxChange() throws Exception {
        recordChange();
        SearchOutboxEvent initial = onlyEvent();
        long initialSequence = initial.getChangeSequence();

        SearchProjectionStore projectionStore = mock(SearchProjectionStore.class);
        @SuppressWarnings("unchecked")
        KafkaTemplate<String, String> kafkaTemplate = mock(KafkaTemplate.class);
        @SuppressWarnings("unchecked")
        SendResult<String, String> sendResult = mock(SendResult.class);
        CompletableFuture<SendResult<String, String>> firstBrokerAck = new CompletableFuture<>();
        CountDownLatch firstSendStarted = new CountDownLatch(1);
        AtomicInteger sends = new AtomicInteger();

        when(projectionStore.isReady()).thenReturn(true);
        when(kafkaTemplate.send(any(), any(), any())).thenAnswer(invocation -> {
            if (sends.getAndIncrement() == 0) {
                firstSendStarted.countDown();
                return firstBrokerAck;
            }
            return CompletableFuture.completedFuture(sendResult);
        });

        SearchOutboxRelay relay = new SearchOutboxRelay(
                repository,
                projectionStore,
                kafkaTemplate,
                new SearchIndexEventCodec(),
                Clock.systemUTC(),
                transactionManager);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        Future<?> relayFuture = null;
        try {
            relayFuture = executor.submit(relay::relay);
            assertTrue(firstSendStarted.await(3, TimeUnit.SECONDS));

            Future<?> newerChange = executor.submit(this::recordChange);
            newerChange.get(3, TimeUnit.SECONDS);

            SearchOutboxEvent refreshed = onlyEvent();
            long refreshedSequence = refreshed.getChangeSequence();
            assertTrue(refreshedSequence > initialSequence);
            assertNull(refreshed.getPublishedAt());

            firstBrokerAck.complete(sendResult);
            relayFuture.get(5, TimeUnit.SECONDS);

            SearchOutboxEvent afterStaleAck = onlyEvent();
            assertEquals(refreshedSequence, afterStaleAck.getChangeSequence());
            assertNull(afterStaleAck.getPublishedAt());
            assertEquals(1, repository.countByPublishedAtIsNull());

            relay.relay();

            SearchOutboxEvent published = onlyEvent();
            assertNotNull(published.getPublishedAt());
            assertEquals(refreshedSequence, published.getChangeSequence());
            assertEquals(0, repository.countByPublishedAtIsNull());
            assertEquals(2, sends.get());
        } finally {
            firstBrokerAck.complete(sendResult);
            if (relayFuture != null) {
                try {
                    relayFuture.get(1, TimeUnit.SECONDS);
                } catch (Exception ignored) {
                    // Best-effort cleanup; assertions above preserve the actual failure.
                }
            }
            executor.shutdownNow();
        }
    }

    private void runConcurrentRecordWave() throws Exception {
        CountDownLatch ready = new CountDownLatch(CONCURRENT_WRITERS);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_WRITERS);
        try {
            List<Future<Object>> futures = java.util.stream.IntStream.range(0, CONCURRENT_WRITERS)
                    .mapToObj(ignored -> executor.submit(() -> {
                        ready.countDown();
                        if (!start.await(10, TimeUnit.SECONDS)) {
                            throw new AssertionError("Timed out waiting to start concurrent outbox writes");
                        }
                        recordChange();
                        return null;
                    }))
                    .toList();

            assertTrue(ready.await(10, TimeUnit.SECONDS));
            start.countDown();
            for (Future<Object> future : futures) future.get(20, TimeUnit.SECONDS);
        } finally {
            start.countDown();
            executor.shutdownNow();
        }
    }

    private void recordChange() {
        new TransactionTemplate(transactionManager).executeWithoutResult(
                status -> recorder.record(SearchChangeType.CONCEPT, SOURCE_ID));
    }

    private SearchOutboxEvent onlyEvent() {
        List<SearchOutboxEvent> events = repository.findAll();
        assertEquals(1, events.size());
        return events.getFirst();
    }
}
