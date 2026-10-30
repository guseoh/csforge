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
    @Autowired tools.jackson.databind.ObjectMapper json;
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
        verifyQuestionHistoryPolicy();
        verifyAllAreaBaselines();
    }

    private void verifyAllAreaBaselines() {
        var topic = packaged.load().stream().filter(f -> f.path().equals("java/topics.json")).findFirst().orElseThrow();
        seed(List.of(topic));
        var changedTopics = (tools.jackson.databind.node.ArrayNode) json.readTree(topic.content());
        for (var item : changedTopics) {
            if (item.path("contentKey").asText().equals("java.core.language-types")) {
                ((tools.jackson.databind.node.ObjectNode) item).put("active", false);
            }
        }
        var invalidTopic = new CanonicalContentFile(topic.path(), json.writeValueAsBytes(changedTopics));
        input.set(List.of(invalidTopic));
        assertThrows(IllegalStateException.class, () -> sync.synchronize(ContentSyncScope.ALL_TOPICS, A, "",
                ContentSyncAuditDigest.calculate(input.get()), true));
        assertEquals(0, jdbc.queryForObject("select count(*) from content_sync_checkpoint where scope = 'ALL_TOPICS'", Integer.class));

        changedTopics = (tools.jackson.databind.node.ArrayNode) json.readTree(topic.content());
        for (var item : changedTopics) {
            if (item.path("contentKey").asText().equals("java.core.language-types")) {
                ((tools.jackson.databind.node.ObjectNode) item).put("title", item.path("title").asText() + " 초기화 검증");
            }
        }
        var safeTopic = new CanonicalContentFile(topic.path(), json.writeValueAsBytes(changedTopics));
        input.set(List.of(safeTopic));
        assertEquals(1, sync.synchronize(ContentSyncScope.ALL_TOPICS, A, "",
                ContentSyncAuditDigest.calculate(input.get()), true).updated());

        var original = packaged.load().stream().filter(f -> f.path().equals("java/language-types/pass-by-value.md")).findFirst().orElseThrow();
        var history = jdbc.queryForList("select * from concept_view_history order by id");
        String invalidContent = new String(original.content(), StandardCharsets.UTF_8).replace("level: 1", "level: 3");
        var invalidConcept = new CanonicalContentFile(original.path(), invalidContent.getBytes(StandardCharsets.UTF_8));
        input.set(List.of(invalidConcept));
        assertThrows(IllegalStateException.class, () -> sync.synchronize(ContentSyncScope.ALL_CONCEPTS, A, "",
                ContentSyncAuditDigest.calculate(input.get()), true));
        assertEquals(0, jdbc.queryForObject("select count(*) from content_sync_checkpoint where scope = 'ALL_CONCEPTS'", Integer.class));

        input.set(List.of(original));
        assertEquals(1, sync.synchronize(ContentSyncScope.ALL_CONCEPTS, A, "",
                ContentSyncAuditDigest.calculate(input.get()), true).updated());
        assertEquals(history, jdbc.queryForList("select * from concept_view_history order by id"));
    }

    private void verifyQuestionHistoryPolicy() {
        var original = packaged.load().stream().filter(f -> f.path().equals("java/language-types/questions.json"))
                .findFirst().orElseThrow();
        var question = (tools.jackson.databind.node.ObjectNode) json.readTree(original.content()).get(0).deepCopy();
        var baseline = questionFile(question);
        seed(List.of(baseline));
        input.set(List.of(baseline));
        sync.synchronize(ContentSyncScope.JAVA_QUESTIONS, A, "", ContentSyncAuditDigest.calculate(input.get()), true);
        question.put("explanationMarkdown", question.get("explanationMarkdown").asText() + "\n추가 해설입니다.");
        input.set(List.of(questionFile(question)));
        assertEquals(1, sync.synchronize(ContentSyncScope.JAVA_QUESTIONS, B, A,
                ContentSyncAuditDigest.calculate(input.get()), false).updated());
        var before = jdbc.queryForList("select * from question order by id");
        long id = ((Number) before.getFirst().get("id")).longValue();
        long session = jdbc.queryForObject(
                "insert into quiz_session(started_at, source) values(current_timestamp, 'STANDARD') returning id", Long.class);
        jdbc.update("insert into attempt(quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                + "values(?, ?, 'GRADED', false, current_timestamp, current_timestamp)", session, id);
        var attempts = jdbc.queryForList("select * from attempt order by id");
        question.put("explanationMarkdown", "풀이 이력이 있는 문제의 변경입니다.");
        input.set(List.of(questionFile(question)));
        assertThrows(IllegalStateException.class, () -> sync.synchronize(ContentSyncScope.JAVA_QUESTIONS,
                "c".repeat(40), B, ContentSyncAuditDigest.calculate(input.get()), false));
        assertEquals(before, jdbc.queryForList("select * from question order by id"));
        assertEquals(attempts, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(B, jdbc.queryForObject(
                "select source_sha from content_sync_checkpoint where scope = 'JAVA_QUESTIONS'", String.class));
    }

    private CanonicalContentFile questionFile(tools.jackson.databind.JsonNode question) {
        return new CanonicalContentFile("java/language-types/questions.json", json.writeValueAsBytes(List.of(question)));
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
