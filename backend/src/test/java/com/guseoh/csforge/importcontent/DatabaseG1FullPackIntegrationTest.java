package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.learning.application.LearningCommandService;
import com.guseoh.csforge.learning.application.LearningQueryService;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;

/** Database G1 도식 17개의 격리 Import, 재수입, 이력 보존과 실제 Reader API를 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class DatabaseG1FullPackIntegrationTest {
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    private static final Map<String, String> ASSETS = Map.ofEntries(
            Map.entry("database/index/btree.md", "index-btree.svg"),
            Map.entry("database/index/composite-index.md", "index-composite.svg"),
            Map.entry("database/isolation/anomalies.md", "isolation-anomalies.svg"),
            Map.entry("database/isolation/read-committed.md", "isolation-read-committed.svg"),
            Map.entry("database/isolation/serializable.md", "isolation-serializable.svg"),
            Map.entry("database/locking/deadlock.md", "locking-deadlock.svg"),
            Map.entry("database/locking/row-lock.md", "locking-row-lock.svg"),
            Map.entry("database/mvcc/cleanup.md", "mvcc-cleanup.svg"),
            Map.entry("database/mvcc/versions.md", "mvcc-versions.svg"),
            Map.entry("database/mvcc/visibility.md", "mvcc-visibility.svg"),
            Map.entry("database/optimizer/explain.md", "optimizer-explain.svg"),
            Map.entry("database/query-patterns/keyset-pagination.md", "query-keyset.svg"),
            Map.entry("database/replication/primary-replica.md", "replication-primary-replica.svg"),
            Map.entry("database/sql/join-semantics.md", "sql-join.svg"),
            Map.entry("database/storage/pages-buffer.md", "storage-pages-buffer.svg"),
            Map.entry("database/storage/wal.md", "storage-wal.svg"),
            Map.entry("database/transaction/atomic-write.md", "transaction-atomic-update.svg")
    );

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_database_g1_test");

    @Autowired CanonicalBootstrapService bootstrap;
    @Autowired CanonicalBootstrapBatchPlanner planner;
    @Autowired CanonicalContentSource source;
    @Autowired ContentImportPreviewService preview;
    @Autowired ContentImportApplyService apply;
    @Autowired LearningQueryService reader;
    @Autowired LearningCommandService commands;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper json;
    @Value("${local.server.port}") int port;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(properties, POSTGRES);
    }

    @Test
    void databaseG1UpdatesExactly17AndPreservesHistoryAndServesAllReaderMarkdown() throws Exception {
        var bootstrapResult = bootstrap.bootstrap();
        assertTrue(bootstrapResult.success(), () -> "Isolated bootstrap: " + bootstrapResult);
        assertEquals(0, bootstrapResult.totals().errors());

        var files = source.load().stream().filter(file -> file.path().startsWith("database/")).toList();
        var concepts = files.stream().filter(file -> file.path().endsWith(".md")).toList();
        assertEquals(38, concepts.size(), "Database Concept inventory");
        var g1 = concepts.stream().filter(file -> ASSETS.containsKey(file.path())).toList();
        assertEquals(17, g1.size());
        var plan = planner.plan(files);
        assertEquals(12, plan.topicCount());
        assertEquals(38, plan.conceptCount());

        for (var file : g1) {
            String svg = ASSETS.get(file.path());
            assertTrue(text(file).contains("](/learning/database/" + svg + ")"), file.path());
            Path asset = Path.of("../frontend/public/learning/database", svg);
            assertTrue(Files.isRegularFile(asset), () -> "Missing SVG: " + asset);
            assertTrue(Files.readString(asset).contains("<svg"), () -> "Malformed SVG: " + asset);
        }

        // 합성된 이전 버전만 사용한다. 실제 운영 데이터나 개인 기록은 읽거나 수정하지 않는다.
        var syntheticOld = g1.stream().map(file -> new CanonicalContentFile(file.path(),
                oldVersion(file).getBytes(StandardCharsets.UTF_8))).toList();
        int oldUpdates = 0;
        for (var batch : planner.plan(syntheticOld).batches()) {
            var p = preview.preview(batch.command());
            assertTrue(p.canApply(), () -> "Synthetic old preview: " + p);
            assertEquals(batch.itemCount(), p.updated());
            assertEquals(0, p.errors());
            assertEquals(batch.itemCount(), apply.apply(batch.command(), p.previewDigest()).updated());
            oldUpdates += p.updated();
        }
        assertEquals(17, oldUpdates);
        var beforeConcepts = jdbc.queryForList(
                "select content_key, id from concept where content_key like 'database.%' order by content_key");
        var beforeQuestions = jdbc.queryForList(
                "select content_key, id from question where content_key like 'database.%' order by content_key");
        var beforeRefs = jdbc.queryForList("select id, url from reference order by id");
        var beforeLinks = jdbc.queryForList(
                "select concept_id, reference_id from concept_reference order by concept_id, reference_id");

        seedHistory();
        var history = history();
        Set<String> keys = g1.stream().map(DatabaseG1FullPackIntegrationTest::key)
                .collect(Collectors.toSet());
        int updated = 0;
        int unchanged = 0;
        for (var batch : plan.batches()) {
            var p = preview.preview(batch.command());
            assertTrue(p.canApply(), () -> "Database G1 preview: " + p);
            assertEquals(0, p.errors());
            for (var item : p.items()) {
                assertEquals(keys.contains(item.contentKey()) ? ImportClassification.UPDATED
                                : ImportClassification.UNCHANGED, item.classification(),
                        () -> "Unexpected canonical change: " + item.contentKey());
            }
            var applied = apply.apply(batch.command(), p.previewDigest());
            assertEquals(0, applied.failed());
            assertEquals(p.updated(), applied.updated());
            updated += applied.updated();
            unchanged += applied.unchanged();
        }
        assertEquals(17, updated);
        assertEquals(plan.totalItemCount() - 17, unchanged);
        assertEquals(beforeConcepts, jdbc.queryForList(
                "select content_key, id from concept where content_key like 'database.%' order by content_key"));
        assertEquals(beforeQuestions, jdbc.queryForList(
                "select content_key, id from question where content_key like 'database.%' order by content_key"));
        assertEquals(beforeRefs, jdbc.queryForList("select id, url from reference order by id"));
        assertEquals(beforeLinks, jdbc.queryForList(
                "select concept_id, reference_id from concept_reference order by concept_id, reference_id"));
        assertEquals(history, history(), "G1 updates must preserve personal history");

        var apiFixtures = new java.util.ArrayList<tools.jackson.databind.JsonNode>();
        for (var file : g1) {
            String contentKey = key(file);
            String assetPath = "/learning/database/" + ASSETS.get(file.path());
            long id = jdbc.queryForObject(
                    "select id from concept where content_key = ?", Long.class, contentKey);
            assertEquals(contentKey, reader.getConcept(id).contentKey());
            assertTrue(reader.getConcept(id).contentMarkdown().contains(assetPath), contentKey);
            var response = HTTP.send(HttpRequest.newBuilder(
                    URI.create("http://127.0.0.1:" + port + "/api/public/concepts/" + id))
                    .GET().build(), HttpResponse.BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), () -> "Reader GET: " + contentKey);
            var body = json.readTree(response.body());
            apiFixtures.add(body);
            assertEquals(contentKey, body.get("contentKey").asText());
            assertTrue(body.get("contentMarkdown").asText().contains(assetPath),
                    () -> "Reader served stale Markdown: " + contentKey);
        }

        Path fixturePath = Path.of("../artifacts/database-g1-api-fixtures.json");
        Files.createDirectories(fixturePath.getParent());
        Files.writeString(fixturePath, json.writeValueAsString(apiFixtures));

        int exactUnchanged = 0;
        for (var batch : plan.batches()) {
            var p = preview.preview(batch.command());
            assertTrue(p.canApply());
            assertEquals(0, p.errors());
            assertEquals(batch.itemCount(), p.unchanged());
            var applied = apply.apply(batch.command(), p.previewDigest());
            assertEquals(0, applied.failed());
            assertEquals(0, applied.updated());
            assertEquals(batch.itemCount(), applied.unchanged());
            exactUnchanged += applied.unchanged();
        }
        assertEquals(plan.totalItemCount(), exactUnchanged);
        assertEquals(history, history(), "Exact Database G1 reimport must preserve history");
        System.out.println("DATABASE_G1_PASS 17 UPDATED, " + exactUnchanged
                + " UNCHANGED, 17 public Reader HTTP 200");
    }

    private void seedHistory() {
        for (String key : List.of("database.core.index.btree", "database.core.mvcc.visibility")) {
            long id = jdbc.queryForObject("select id from concept where content_key = ?", Long.class, key);
            commands.recordView(id);
            commands.updateProgress(id, LearningStatus.LEARNING, true);
            commands.upsertNote(id, "Database G1 history: " + key);
        }
        long question = jdbc.queryForObject(
                "select id from question where content_key like 'database.%' order by content_key limit 1", Long.class);
        long session = jdbc.queryForObject(
                "insert into quiz_session(started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        jdbc.update("insert into quiz_question (quiz_session_id, question_id, position) values (?, ?, 0)",
                session, question);
        long attempt = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, session, question);
        jdbc.update("insert into wrong_note(question_id, status, wrong_count, first_wrong_at, "
                + "last_wrong_at, last_wrong_attempt_id) values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)",
                question, attempt);
        jdbc.update("insert into review_schedule(question_id, status, stage, due_at, last_processed_attempt_id) "
                + "values (?, 'SCHEDULED', 1, current_timestamp + interval '1 day', ?)", question, attempt);
        jdbc.update("insert into review_history(question_id, quiz_session_id, attempt_id, result, "
                + "stage_before, stage_after, reviewed_at, next_due_at) values "
                + "(?, ?, ?, 'WRONG', 1, 1, current_timestamp, current_timestamp + interval '1 day')",
                question, session, attempt);
    }

    private Map<String, List<Map<String, Object>>> history() {
        Map<String, List<Map<String, Object>>> snapshot = new LinkedHashMap<>();
        for (String table : List.of("concept_progress", "concept_view_history", "personal_note",
                "quiz_session", "quiz_question", "attempt", "wrong_note",
                "review_schedule", "review_history")) {
            snapshot.put(table, jdbc.queryForList("select * from " + table + " order by 1"));
        }
        return snapshot;
    }

    private static String oldVersion(CanonicalContentFile file) {
        String source = text(file);
        String image = source.lines()
                .filter(line -> line.startsWith("![")
                        && line.contains("](/learning/database/" + ASSETS.get(file.path()) + ")"))
                .findFirst().orElseThrow(() -> new IllegalStateException("G1 image missing: " + file.path()));
        return source.replace(image, "기존 텍스트 도식 (합성 테스트 기준)");
    }

    private static String key(CanonicalContentFile file) {
        return text(file).lines().filter(line -> line.startsWith("contentKey: "))
                .map(line -> line.substring("contentKey: ".length())).findFirst().orElseThrow();
    }

    private static String text(CanonicalContentFile file) {
        return new String(file.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
    }
}
