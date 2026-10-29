package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 기준점 확정, 롤백, 재시도와 개인 기록 보존을 실제 PostgreSQL에서 검증한다. */
@SpringBootTest
@Testcontainers
class ContentSyncIntegrationTest {
    @Container static final PostgreSQLContainer<?> DB = PostgresIntegrationTestSupport.container("sync_test");
    @DynamicPropertySource static void database(DynamicPropertyRegistry r) { PostgresIntegrationTestSupport.registerDataSourceProperties(r, DB); }
    @Autowired ContentSyncService sync;
    @Autowired ContentImportPreviewService preview;
    @Autowired ClasspathCanonicalContentSource packaged;
    @Autowired JdbcTemplate jdbc;
    @Autowired AtomicReference<List<CanonicalContentFile>> input;
    @Autowired ContentImportGuard guard;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
    @MockitoSpyBean ContentImportApplyService apply;
    private static final String A = "a".repeat(40), B = "b".repeat(40);

    @TestConfiguration static class Source {
        @Bean AtomicReference<List<CanonicalContentFile>> syncInput() { return new AtomicReference<>(List.of()); }
        @Bean @Primary CanonicalContentSource testSource(AtomicReference<List<CanonicalContentFile>> source) { return source::get; }
    }

    @Test void baselineFailureRollbackRetryAndHistoryPreservation() throws Exception {
        var files = packaged.load();
        var topic = files.stream().filter(f -> f.path().equals("java/topics.json")).findFirst().orElseThrow();
        var concepts = files.stream().filter(f -> f.path().equals("java/language-types/pass-by-value.md")
                || f.path().equals("java/language-types/primitive-reference-values.md")).toList();
        seed(List.of(topic)); seed(concepts); input.set(concepts);
        String digest = ContentSyncAuditDigest.calculate(concepts);
        assertEquals(0, sync.synchronize(ContentSyncScope.JAVA_CONCEPTS, A, "", digest, true).updated());
        var identity = jdbc.queryForList("select id, content_key from concept order by id");
        long id = ((Number) identity.getFirst().get("id")).longValue();
        jdbc.update("insert into concept_view_history(concept_id, viewed_at) values (?, current_timestamp)", id);
        var history = jdbc.queryForList("select * from concept_view_history order by id");
        var before = jdbc.queryForList("select id, content_markdown from concept order by id");
        var changed = concepts.stream().map(f -> new CanonicalContentFile(f.path(),
                (new String(f.content(), StandardCharsets.UTF_8) + "\n\n추가 설명입니다.\n").getBytes(StandardCharsets.UTF_8))).toList();
        input.set(changed); String next = ContentSyncAuditDigest.calculate(changed);
        assertThrows(IllegalStateException.class, () -> sync.synchronize(ContentSyncScope.JAVA_CONCEPTS, B, B, next, false));
        doAnswer(invocation -> { invocation.callRealMethod(); throw new IllegalStateException("simulated response failure"); })
                .when(apply).apply(any(), anyString());
        assertThrows(IllegalStateException.class, () -> sync.synchronize(ContentSyncScope.JAVA_CONCEPTS, B, A, next, false));
        assertEquals(before, jdbc.queryForList("select id, content_markdown from concept order by id"));
        assertEquals(A, jdbc.queryForObject("select source_sha from content_sync_checkpoint", String.class));
        reset(apply);
        assertEquals(2, sync.synchronize(ContentSyncScope.JAVA_CONCEPTS, B, A, next, false).updated());
        assertEquals(0, sync.synchronize(ContentSyncScope.JAVA_CONCEPTS, B, B, next, false).updated());
        assertEquals(identity, jdbc.queryForList("select id, content_key from concept order by id"));
        assertEquals(history, jdbc.queryForList("select * from concept_view_history order by id"));
        assertEquals(B, jdbc.queryForObject("select source_sha from content_sync_checkpoint", String.class));
        verifyConcurrentLease(changed);
        assertEquals(history, jdbc.queryForList("select * from concept_view_history order by id"));
    }

    private void verifyConcurrentLease(List<CanonicalContentFile> files) throws Exception {
        String targetSha = "c".repeat(40);
        var target = files.stream().map(f -> new CanonicalContentFile(f.path(),
                (new String(f.content(), StandardCharsets.UTF_8) + "\n동시 실행 검증입니다.\n")
                        .getBytes(StandardCharsets.UTF_8))).toList();
        input.set(target);
        String digest = ContentSyncAuditDigest.calculate(target);
        var started = new java.util.concurrent.CountDownLatch(2);
        try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            var pending = new ArrayList<java.util.concurrent.Future<Boolean>>();
            new org.springframework.transaction.support.TransactionTemplate(transactions).executeWithoutResult(status -> {
                guard.acquire();
                for (int index = 0; index < 2; index++) {
                    pending.add(executor.submit(() -> {
                        started.countDown();
                        try {
                            sync.synchronize(ContentSyncScope.JAVA_CONCEPTS, targetSha, B, digest, false);
                            return true;
                        } catch (IllegalStateException stale) {
                            assertTrue(stale.getMessage().contains("Baseline lease mismatch"));
                            return false;
                        }
                    }));
                }
                try {
                    assertTrue(started.await(5, java.util.concurrent.TimeUnit.SECONDS));
                    for (var task : pending) {
                        assertThrows(java.util.concurrent.TimeoutException.class,
                                () -> task.get(200, java.util.concurrent.TimeUnit.MILLISECONDS));
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(e);
                }
            });
            int successes = 0;
            for (var task : pending) {
                if (task.get(30, java.util.concurrent.TimeUnit.SECONDS)) successes++;
            }
            assertEquals(1, successes);
        }
        assertEquals(targetSha, jdbc.queryForObject("select source_sha from content_sync_checkpoint", String.class));
    }

    private void seed(List<CanonicalContentFile> files) {
        var command = new ImportFilesCommand(files.stream().map(f -> new ImportSourceFile(f.path(), f.content())).toList());
        var p = preview.preview(command); assertTrue(p.canApply(), p.toString());
        apply.apply(command, p.previewDigest());
    }
}
