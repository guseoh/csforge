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

/** OS G1 도식 47개의 격리 Import, 재수입, 이력 보존과 실제 Reader API를 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OperatingSystemsG1FullPackIntegrationTest {
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    private static final Set<String> CHANGED = Set.of(
            "operating-systems/kernel-boundary/system-call-flow.md",
            "operating-systems/kernel-boundary/system-call.md",
            "operating-systems/kernel-boundary/user-kernel-mode.md",
            "operating-systems/process/parent-child.md",
            "operating-systems/process/process-address-space.md",
            "operating-systems/process/process-state.md",
            "operating-systems/race-critical-section/critical-section.md",
            "operating-systems/race-critical-section/interleaving.md",
            "operating-systems/threads/java-virtual-thread-boundary.md",
            "operating-systems/threads/process-vs-thread.md",
            "operating-systems/threads/thread-create-switch-cost.md",
            "operating-systems/threads/thread-pool.md",
            "operating-systems/threads/thread-shared-state.md"
    );
    private static String asset(CanonicalContentFile file) {
        var matcher = java.util.regex.Pattern.compile("\\]\\(/learning/operating-systems/([^)/]+\\.svg)\\)").matcher(text(file));
        return matcher.find() ? matcher.group(1) : null;
    }

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_os_g1_test");

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
    void osG1UpdatesExactly13AndPreservesHistoryAndServesAll47ReaderMarkdown() throws Exception {
        var bootstrapResult = bootstrap.bootstrap();
        assertTrue(bootstrapResult.success(), () -> "Isolated bootstrap: " + bootstrapResult);
        assertEquals(0, bootstrapResult.totals().errors());

        var files = source.load().stream().filter(file -> file.path().startsWith("operating-systems/")).toList();
        var concepts = files.stream().filter(file -> file.path().endsWith(".md")).toList();
        assertEquals(97, concepts.size(), "OS Concept inventory");
        var g1 = concepts.stream().filter(file -> CHANGED.contains(file.path())).toList();
        var diagrams = concepts.stream().filter(file -> asset(file) != null).toList();
        assertEquals(47, diagrams.size());
        assertEquals(46, diagrams.stream().map(OperatingSystemsG1FullPackIntegrationTest::asset).distinct().count());
        assertEquals(13, g1.size());
        var plan = planner.plan(files);
        assertEquals(12, plan.topicCount());
        assertEquals(97, plan.conceptCount());

        for (var file : diagrams) {
            String svg = asset(file);
            assertTrue(text(file).contains("](/learning/operating-systems/" + svg + ")"), file.path());
            Path asset = Path.of("../frontend/public/learning/operating-systems", svg);
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
        assertEquals(13, oldUpdates);
        var beforeConcepts = jdbc.queryForList(
                "select content_key, id from concept where content_key like 'operating-systems.%' order by content_key");
        var beforeQuestions = jdbc.queryForList(
                "select content_key, id from question where content_key like 'operating-systems.%' order by content_key");
        var beforeRefs = jdbc.queryForList("select id, url from reference order by id");
        var beforeLinks = jdbc.queryForList(
                "select concept_id, reference_id from concept_reference order by concept_id, reference_id");

        seedHistory();
        var history = history();
        Set<String> keys = g1.stream().map(OperatingSystemsG1FullPackIntegrationTest::key)
                .collect(Collectors.toSet());
        int updated = 0;
        int unchanged = 0;
        for (var batch : plan.batches()) {
            var p = preview.preview(batch.command());
            assertTrue(p.canApply(), () -> "OS G1 preview: " + p);
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
        assertEquals(13, updated);
        assertEquals(plan.totalItemCount() - 13, unchanged);
        assertEquals(beforeConcepts, jdbc.queryForList(
                "select content_key, id from concept where content_key like 'operating-systems.%' order by content_key"));
        assertEquals(beforeQuestions, jdbc.queryForList(
                "select content_key, id from question where content_key like 'operating-systems.%' order by content_key"));
        assertEquals(beforeRefs, jdbc.queryForList("select id, url from reference order by id"));
        assertEquals(beforeLinks, jdbc.queryForList(
                "select concept_id, reference_id from concept_reference order by concept_id, reference_id"));
        assertEquals(history, history(), "G1 updates must preserve personal history");

        var apiFixtures = new java.util.ArrayList<tools.jackson.databind.JsonNode>();
        for (var file : diagrams) {
            String contentKey = key(file);
            String assetPath = "/learning/operating-systems/" + asset(file);
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

        Path fixturePath = Path.of("../artifacts/operating-systems-g1-api-fixtures.json");
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
        assertEquals(history, history(), "Exact OS G1 reimport must preserve history");
        System.out.println("OS_G1_PASS 13 UPDATED, " + exactUnchanged
                + " UNCHANGED, 47 public Reader HTTP 200");
    }

    private void seedHistory() {
        for (String key : List.of("operating-systems.core.process.process-address-space", "operating-systems.core.process.process-state")) {
            long id = jdbc.queryForObject("select id from concept where content_key = ?", Long.class, key);
            commands.recordView(id);
            commands.updateProgress(id, LearningStatus.LEARNING, true);
            commands.upsertNote(id, "OS G1 history: " + key);
        }
        long question = jdbc.queryForObject(
                "select id from question where content_key like 'operating-systems.%' order by content_key limit 1", Long.class);
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
                        && line.contains("](/learning/operating-systems/" + asset(file) + ")"))
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
