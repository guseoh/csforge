package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatch;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.learning.application.LearningQueryService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** All 22 historical Java Reference corrections must apply once without changing learning history or unrelated links. */
@Testcontainers
@SpringBootTest
class JavaReferenceFullMigrationIntegrationTest {
    private static final String STATIC_FACTORY = "java.core.api-design.static-factory-method";
    private static final Set<String> REMOVED_URLS = Set.of(
            "https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/",
            "https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/",
            "https://tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode/",
            "https://tecoble.techcourse.co.kr/post/2021-05-17-constructor/",
            "https://d2.naver.com/helloworld/4911107");

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_reference_r1_full_migration");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalBootstrapBatchPlanner batchPlanner;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired LearningQueryService learningQueryService;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper objectMapper;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void allTwentyTwoReferenceUpdatesPreserveIdentityHistoryAndImportIdempotency() throws Exception {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical bootstrap: " + initial);
        assertEquals(0, initial.totals().errors());
        assertEquals(3380, initial.totalItems());

        Map<String, CanonicalContentFile> canonical = new HashMap<>();
        for (CanonicalContentFile file : contentSource.load()) canonical.put(file.path(), file);
        JsonNode fixture;
        try (InputStream source = getClass().getResourceAsStream(
                "/reference-correction/issue-222-r1-before.json")) {
            assertTrue(source != null, "Historical Reference fixture missing");
            fixture = objectMapper.readTree(source);
        }
        assertEquals("2ab1ccbb29ca0bc07858c20f56ae3a4826018d4f",
                fixture.get("base").asText());
        List<ImportSourceFile> historicalFiles = new ArrayList<>();
        List<ImportSourceFile> correctedFiles = new ArrayList<>();
        Set<String> paths = new HashSet<>();
        for (JsonNode changed : fixture.get("files")) {
            String path = changed.get("path").asText();
            assertTrue(paths.add(path), "Duplicate historical fixture " + path);
            CanonicalContentFile current = canonical.get(path);
            assertTrue(current != null, "Missing canonical file " + path);
            String corrected = new String(current.content(), StandardCharsets.UTF_8);
            String historical = corrected;
            for (JsonNode hunk : changed.get("hunks")) {
                String from = hunk.get("current").asText();
                String to = hunk.get("previous").asText();
                int position = historical.indexOf(from);
                assertTrue(position >= 0, "Could not locate exact current diff hunk: " + path);
                assertEquals(position, historical.lastIndexOf(from),
                        "Ambiguous historical diff hunk: " + path);
                historical = historical.substring(0, position) + to
                        + historical.substring(position + from.length());
            }
            assertFalse(corrected.equals(historical), "Unchanged historical file " + path);
            int correctedBodyStart = corrected.indexOf("\n---\n", 4);
            int historicalBodyStart = historical.indexOf("\n---\n", 4);
            assertTrue(correctedBodyStart >= 0 && historicalBodyStart >= 0);
            assertEquals(corrected.substring(correctedBodyStart),
                    historical.substring(historicalBodyStart),
                    "Historical fixture unexpectedly changes Concept body: " + path);
            historicalFiles.add(file(path, historical));
            correctedFiles.add(file(path, corrected));
        }
        assertEquals(22, historicalFiles.size());
        ImportFilesCommand historicalCommand = new ImportFilesCommand(historicalFiles);
        var historicalPreview = previewService.preview(historicalCommand);
        assertTrue(historicalPreview.canApply(), () -> "Old Reference preview: " + historicalPreview);
        assertEquals(0, historicalPreview.errors());
        assertEquals(22, historicalPreview.updated());
        assertEquals(22, applyService.apply(
                historicalCommand, historicalPreview.previewDigest()).updated());

        seedLearningHistory();
        Map<String, List<Map<String, Object>>> historyBefore = historySnapshot();
        List<Map<String, Object>> conceptsBefore =
                jdbc.queryForList("select content_key, id from concept order by content_key");
        List<Map<String, Object>> questionsBefore =
                jdbc.queryForList("select content_key, id from question order by content_key");
        List<Map<String, Object>> referencesBefore =
                jdbc.queryForList("select url, id from reference order by url");
        Map<String, Long> linksBefore = linkIdentities();
        Map<String, String> notesBefore = linkNotes();
        assertEquals(22, paths.size());

        ImportFilesCommand correctedCommand = new ImportFilesCommand(correctedFiles);
        var correctedPreview = previewService.preview(correctedCommand);
        assertTrue(correctedPreview.canApply(), () -> "Corrected preview: " + correctedPreview);
        assertEquals(0, correctedPreview.errors());
        assertEquals(0, correctedPreview.created());
        assertEquals(22, correctedPreview.updated());
        assertEquals(22, applyService.apply(
                correctedCommand, correctedPreview.previewDigest()).updated());

        assertEquals(historyBefore, historySnapshot(), "Personal/history data changed");
        assertEquals(conceptsBefore,
                jdbc.queryForList("select content_key, id from concept order by content_key"));
        assertEquals(questionsBefore,
                jdbc.queryForList("select content_key, id from question order by content_key"));
        assertEquals(referencesBefore,
                jdbc.queryForList("select url, id from reference order by url"),
                "Existing global Reference URL identity changed");

        Map<String, Long> linksAfter = linkIdentities();
        assertEquals(5, linksBefore.size() - linksAfter.size(), "Expected five removed links");
        assertTrue(linksBefore.entrySet().containsAll(linksAfter.entrySet()),
                "Existing Concept-to-Reference link identities were not preserved");
        Set<String> removed = new HashSet<>(linksBefore.keySet());
        removed.removeAll(linksAfter.keySet());
        assertEquals(5, removed.size());
        for (String key : removed) {
            String url = key.substring(key.indexOf("|") + 1);
            assertTrue(REMOVED_URLS.contains(url), "Unexpected deleted URL: " + key);
        }
        assertEquals(0, jdbc.queryForObject(
                "select count(*) from concept_reference cr "
                        + "join concept c on c.id = cr.concept_id "
                        + "join reference r on r.id = cr.reference_id "
                        + "where c.content_key = ? and r.url = ?",
                Integer.class, STATIC_FACTORY,
                "https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/"));

        Map<String, String> notesAfter = linkNotes();
        long changedNotes = notesAfter.entrySet().stream()
                .filter(entry -> !java.util.Objects.equals(
                        entry.getValue(), notesBefore.get(entry.getKey()))).count();
        assertEquals(18, changedNotes);
        assertEquals("JDK 7", referenceTitle("https://d2.naver.com/helloworld/1219"));
        assertEquals("신규 포인트 시스템 전환기 #2 – 오픈 준비 단계",
                referenceTitle("https://techblog.woowahan.com/2588/"));

        long factoryId = jdbc.queryForObject(
                "select id from concept where content_key = ?", Long.class, STATIC_FACTORY);
        var factoryDetail = learningQueryService.getConcept(factoryId);
        assertTrue(factoryDetail.references().stream()
                .noneMatch(reference -> REMOVED_URLS.contains(reference.url())));
        long pathId = jdbc.queryForObject(
                "select id from concept where content_key = ?", Long.class,
                "java.core.io-nio.path-files-api");
        assertTrue(learningQueryService.getConcept(pathId).references().stream()
                .anyMatch(reference -> reference.url().equals("https://d2.naver.com/helloworld/1219")
                        && reference.title().equals("JDK 7")
                        && reference.relationNote().contains("NIO.2")));

        int previewItemCount = 0;
        for (CanonicalBootstrapBatch batch : batchPlanner.plan(contentSource.load()).batches()) {
            var preview = previewService.preview(batch.command());
            assertTrue(preview.canApply(), () -> "Exact preview failed: " + batch.sequence());
            assertEquals(0, preview.errors(), "Preview errors in batch " + batch.sequence());
            for (var item : preview.items()) {
                assertEquals(ImportClassification.UNCHANGED, item.classification(),
                        () -> "Not idempotent: " + item.contentKey());
                previewItemCount++;
            }
        }
        assertEquals(3380, previewItemCount);
        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Exact full-pack reimport: " + repeated);
        assertEquals(3380, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(historyBefore, historySnapshot());
        assertEquals(linksAfter, linkIdentities());
    }

    private void seedLearningHistory() {
        long conceptId = jdbc.queryForObject("select id from concept where content_key = ?",
                Long.class, STATIC_FACTORY);
        long questionId = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, STATIC_FACTORY + ".%");
        jdbc.update("insert into concept_progress (concept_id, status, bookmarked, first_viewed_at, last_viewed_at) "
                        + "values (?, 'LEARNING', true, current_timestamp, current_timestamp)", conceptId);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'R1 historical note')",
                conceptId);
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        jdbc.update("insert into quiz_question (quiz_session_id, question_id, position) values (?, ?, 0)",
                sessionId, questionId);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                        + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, last_reviewed_at, last_processed_attempt_id) "
                        + "values (?, 'SCHEDULED', 1, current_timestamp + interval '1 day', current_timestamp, ?)",
                questionId, attemptId);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, "
                        + "stage_before, stage_after, reviewed_at, next_due_at) "
                        + "values (?, ?, ?, 'WRONG', 1, 1, current_timestamp, current_timestamp + interval '1 day')",
                questionId, sessionId, attemptId);
    }

    private Map<String, List<Map<String, Object>>> historySnapshot() {
        Map<String, List<Map<String, Object>>> snapshots = new LinkedHashMap<>();
        for (String table : List.of(
                "concept_progress", "personal_note", "quiz_session", "quiz_question",
                "attempt", "wrong_note", "review_schedule", "review_history")) {
            String order = table.equals("concept_progress") ? "concept_id"
                    : table.equals("review_schedule") ? "question_id" : "id";
            snapshots.put(table, jdbc.queryForList("select * from " + table + " order by " + order));
        }
        return snapshots;
    }

    private Map<String, Long> linkIdentities() {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Map<String, Object> row : jdbc.queryForList(
                "select c.content_key as concept_key, r.url, r.id as ref_id "
                        + "from concept_reference cr "
                        + "join concept c on c.id = cr.concept_id "
                        + "join reference r on r.id = cr.reference_id "
                        + "order by c.content_key, r.url")) {
            result.put(row.get("concept_key") + "|" + row.get("url"),
                    ((Number) row.get("ref_id")).longValue());
        }
        return result;
    }

    private Map<String, String> linkNotes() {
        Map<String, String> result = new HashMap<>();
        for (Map<String, Object> row : jdbc.queryForList(
                "select c.content_key as concept_key, r.url, cr.relation_note "
                        + "from concept_reference cr "
                        + "join concept c on c.id = cr.concept_id "
                        + "join reference r on r.id = cr.reference_id")) {
            result.put(row.get("concept_key") + "|" + row.get("url"),
                    (String) row.get("relation_note"));
        }
        return result;
    }

    private String referenceTitle(String url) {
        return jdbc.queryForObject("select title from reference where url = ?", String.class, url);
    }

    private static ImportSourceFile file(String path, String source) {
        return new ImportSourceFile(path, source.getBytes(StandardCharsets.UTF_8));
    }
}
