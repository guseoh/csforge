package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 동일 Search source의 동시 변경이 하나의 pending outbox 행으로 안전하게 합쳐지는지 검증한다. */
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
                        new TransactionTemplate(transactionManager).executeWithoutResult(
                                status -> recorder.record(SearchChangeType.CONCEPT, SOURCE_ID));
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

    private SearchOutboxEvent onlyEvent() {
        List<SearchOutboxEvent> events = repository.findAll();
        assertEquals(1, events.size());
        return events.getFirst();
    }
}
