package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
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
import com.guseoh.csforge.importcontent.application.ImportItemPreview;
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
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 전체 Network 도식의 격리 Import, 재수입, 개인 이력과 Reader HTTP 조회를 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class NetworkDiagramFullPackIntegrationTest {
    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private static final String TEXT_PILOT =
            "network-http/request-journey/transport-establishment.md";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_network_diagram_qa");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalBootstrapBatchPlanner batchPlanner;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired LearningQueryService learningQueryService;
    @Autowired LearningCommandService commandService;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Value("$" + "{local.server.port}") int port;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void all53DiagramUpdatesPreserveHistoryAndReaderAndReimportUnchanged() throws Exception {
        var initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial isolated bootstrap: " + initial);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        var networkFiles = contentSource.load().stream()
                .filter(file -> file.path().startsWith("network-http/")).toList();
        var concepts = networkFiles.stream().filter(f -> f.path().endsWith(".md")).toList();
        assertEquals(127, concepts.size());
        var diagrams = concepts.stream()
                .filter(f -> !f.path().equals(TEXT_PILOT) && sourceText(f).contains("```csforge-viz"))
                .toList();
        assertEquals(53, diagrams.size());
        assertTrue(concepts.stream().anyMatch(f -> f.path().equals(TEXT_PILOT)
                && sourceText(f).contains("```csforge-viz")));

        var historical = diagrams.stream().map(file -> new CanonicalContentFile(
                file.path(), removeDiagram(sourceText(file)).getBytes(StandardCharsets.UTF_8))).toList();
        int historicalUpdates = 0;
        for (var batch : batchPlanner.plan(historical).batches()) {
            var preview = previewService.preview(batch.command());
            assertTrue(preview.canApply(), () -> "Historical preview: " + preview);
            assertEquals(0, preview.errors());
            assertEquals(batch.itemCount(), preview.updated());
            var result = applyService.apply(batch.command(), preview.previewDigest());
            assertEquals(batch.itemCount(), result.updated());
            historicalUpdates += result.updated();
        }
        assertEquals(53, historicalUpdates);

        var conceptIds = jdbc.queryForList("select content_key, id from concept "
                + "where content_key like 'network-http.%' order by content_key");
        var questionIds = jdbc.queryForList("select content_key, id from question "
                + "where content_key like 'network-http.%' order by content_key");
        var references = jdbc.queryForList("select url, id from reference order by url");
        var links = jdbc.queryForList("select concept_id, reference_id from concept_reference "
                + "order by concept_id, reference_id");
        seedHistory();
        var history = historySnapshot();

        Set<String> changedKeys = diagrams.stream().map(NetworkDiagramFullPackIntegrationTest::contentKey)
                .collect(Collectors.toSet());
        var plan = batchPlanner.plan(networkFiles);
        assertEquals(127, plan.conceptCount());
        assertTrue(plan.topicCount() > 0 && plan.questionCount() > 0);
        int updated = 0;
        int unchanged = 0;
        for (var batch : plan.batches()) {
            var preview = previewService.preview(batch.command());
            assertTrue(preview.canApply(), () -> "Network preview: " + preview);
            assertEquals(0, preview.errors());
            for (ImportItemPreview item : preview.items()) {
                assertTrue(item.errors().isEmpty(), () -> "Invalid item: " + item.contentKey());
                assertEquals(changedKeys.contains(item.contentKey())
                                ? ImportClassification.UPDATED : ImportClassification.UNCHANGED,
                        item.classification(), () -> "Unexpected classification: " + item.contentKey());
            }
            var applied = applyService.apply(batch.command(), preview.previewDigest());
            assertEquals(0, applied.failed());
            assertEquals(preview.updated(), applied.updated());
            assertEquals(preview.unchanged(), applied.unchanged());
            updated += applied.updated();
            unchanged += applied.unchanged();
        }
        assertEquals(53, updated);
        assertEquals(plan.totalItemCount() - 53, unchanged);
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept "
                + "where content_key like 'network-http.%' order by content_key"));
        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question "
                + "where content_key like 'network-http.%' order by content_key"));
        assertEquals(references, jdbc.queryForList("select url, id from reference order by url"));
        assertEquals(links, jdbc.queryForList("select concept_id, reference_id from concept_reference "
                + "order by concept_id, reference_id"));
        assertEquals(history, historySnapshot(), "History changed on diagram updates");

        for (CanonicalContentFile file : diagrams) {
            String key = contentKey(file);
            long id = jdbc.queryForObject("select id from concept where content_key = ?",
                    Long.class, key);
            var detail = learningQueryService.getConcept(id);
            assertEquals(key, detail.contentKey());
            assertTrue(detail.contentMarkdown().contains("```csforge-viz"), key);
            HttpResponse<String> response = HTTP.send(HttpRequest.newBuilder(
                    URI.create("http://127.0.0.1:" + port + "/api/concepts/" + id))
                    .GET().build(), HttpResponse.BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), () -> "Reader HTTP: " + key);
            JsonNode body = mapper.readTree(response.body());
            assertEquals(key, body.get("contentKey").asText());
            assertTrue(body.get("contentMarkdown").asText().contains("```csforge-viz"), key);
        }

        int secondUnchanged = 0;
        for (var batch : plan.batches()) {
            var preview = previewService.preview(batch.command());
            assertTrue(preview.canApply());
            assertEquals(0, preview.errors());
            assertEquals(batch.itemCount(), preview.unchanged());
            var applied = applyService.apply(batch.command(), preview.previewDigest());
            assertEquals(batch.itemCount(), applied.unchanged());
            assertEquals(0, applied.updated());
            assertEquals(0, applied.failed());
            secondUnchanged += applied.unchanged();
        }
        assertEquals(plan.totalItemCount(), secondUnchanged);
        assertEquals(history, historySnapshot(), "History changed on exact reimport");
        System.out.println("NETWORK_DIAGRAM_FULL_PACK_PASS 53 UPDATED, "
                + secondUnchanged + " UNCHANGED, 53 Reader HTTP 200");
    }

    private void seedHistory() {
        for (String key : List.of("network-http.core.local-delivery.arp",
                "network-http.core.http-cache.if-none-match")) {
            long id = jdbc.queryForObject("select id from concept where content_key = ?",
                    Long.class, key);
            commandService.recordView(id);
            commandService.updateProgress(id, LearningStatus.LEARNING, true);
            commandService.upsertNote(id, "Preserved note: " + key);
        }
        long question = jdbc.queryForObject("select id from question "
                + "where content_key like 'network-http.%' order by content_key limit 1", Long.class);
        long session = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attempt = jdbc.queryForObject("insert into attempt (quiz_session_id, question_id, "
                + "grading_status, correct, answered_at, graded_at) values (?, ?, 'GRADED', false, "
                + "current_timestamp, current_timestamp) returning id", Long.class, session, question);
        jdbc.update("insert into quiz_question (quiz_session_id, question_id, position) values (?, ?, 0)",
                session, question);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, "
                + "last_wrong_at, last_wrong_attempt_id) values (?, 'ACTIVE', 1, "
                + "current_timestamp, current_timestamp, ?)", question, attempt);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, "
                + "last_processed_attempt_id) values (?, 'SCHEDULED', 1, "
                + "current_timestamp + interval '1 day', ?)", question, attempt);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, "
                + "stage_before, stage_after, reviewed_at, next_due_at) values (?, ?, ?, 'WRONG', "
                + "1, 1, current_timestamp, current_timestamp + interval '1 day')",
                question, session, attempt);
    }

    private Map<String, List<Map<String, Object>>> historySnapshot() {
        Map<String, List<Map<String, Object>>> snapshot = new LinkedHashMap<>();
        for (String table : List.of("concept_progress", "concept_view_history", "personal_note",
                "quiz_session", "quiz_question", "attempt", "wrong_note",
                "review_schedule", "review_history")) {
            snapshot.put(table, jdbc.queryForList("select * from " + table + " order by 1"));
        }
        return snapshot;
    }

    private static String sourceText(CanonicalContentFile file) {
        return new String(file.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
    }

    private static String contentKey(CanonicalContentFile file) {
        return sourceText(file).lines().filter(line -> line.startsWith("contentKey: "))
                .map(line -> line.substring("contentKey: ".length())).findFirst().orElseThrow();
    }

    private static String removeDiagram(String content) {
        int start = content.indexOf("```csforge-viz");
        assertTrue(start >= 0, "Missing visualization");
        int end = content.indexOf("```", start + "```csforge-viz".length());
        assertTrue(end > start, "Unclosed visualization");
        assertTrue(content.indexOf("```csforge-viz", end + 3) < 0, "Multiple fences");
        return content.substring(0, start) + content.substring(end + 3);
    }
}
