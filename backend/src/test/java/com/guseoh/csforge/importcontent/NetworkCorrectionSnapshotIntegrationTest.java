package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
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

/** Issue #202 Network old-main to corrected canonical import and personal history regression. */
@Testcontainers
@SpringBootTest
class NetworkCorrectionSnapshotIntegrationTest {
    private static final String BASELINE_ENV = "CSFORGE_NETWORK_BASELINE_DIR";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_network_correction_snapshot");

    @Autowired CanonicalBootstrapService bootstrap;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired LearningQueryService learningQueryService;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void actualPreviousNetworkPackToCorrectionIsIdempotentAndPreservesHistory() throws Exception {
        String baseline = System.getenv(BASELINE_ENV);
        assumeTrue(baseline != null && !baseline.isBlank(), "Dedicated Network snapshot workflow only");
        Path root = Path.of(baseline);
        assertTrue(Files.isDirectory(root), "Old main snapshot missing");

        var initial = bootstrap.bootstrap();
        assertTrue(initial.success(), () -> "Corrected canonical bootstrap failed: " + initial);
        assertEquals(3380, initial.totalItems());
        assertEquals(0, initial.totals().errors());
        long referenceRelations = jdbc.queryForObject(
                "select count(*) from concept_reference", Long.class);

        List<ImportSourceFile> previous = new ArrayList<>();
        List<ImportSourceFile> corrected = new ArrayList<>();
        for (CanonicalContentFile current : contentSource.load()) {
            if (!current.path().startsWith("network-http/")
                    || !(current.path().endsWith(".md") || current.path().endsWith("/questions.json"))) {
                continue;
            }
            String relative = current.path().substring("network-http/".length());
            byte[] oldBytes = Files.readAllBytes(root.resolve(relative));
            if (Arrays.equals(oldBytes, current.content())) continue;
            previous.add(new ImportSourceFile(current.path(), oldBytes));
            corrected.add(new ImportSourceFile(current.path(), current.content()));
        }
        assertEquals(29, previous.size(), "Expected 19 Concept Markdown + 10 Question JSON files");

        int oldUpdates = importChanged(previous);
        assertEquals(40, oldUpdates, "Expected previous versions of 19 Concept and 21 Question");

        long conceptId = jdbc.queryForObject("select id from concept where content_key = ?",
                Long.class, "network-http.core.tls.tls-handshake");
        long questionId = jdbc.queryForObject("select id from question where content_key = ?",
                Long.class, "network-http.core.dns.negative-cache.q2");
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'Network history snapshot')", conceptId);
        long sessionId = jdbc.queryForObject("insert into quiz_session (started_at, source) "
                + "values (current_timestamp, 'STANDARD') returning id", Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, "
                + "last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, last_reviewed_at, "
                + "last_processed_attempt_id) values (?, 'SCHEDULED', 1, "
                + "current_timestamp + interval '1 day', current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, "
                + "stage_before, stage_after, reviewed_at, next_due_at) values (?, ?, ?, 'WRONG', 1, 1, "
                + "current_timestamp, current_timestamp + interval '1 day')", questionId, sessionId, attemptId);

        List<String> historyTables = List.of("personal_note", "quiz_session", "attempt",
                "wrong_note", "review_schedule", "review_history", "concept_progress");
        Map<String, List<Map<String, Object>>> history = new LinkedHashMap<>();
        for (String table : historyTables) {
            history.put(table, jdbc.queryForList("select * from " + table + " order by 1"));
        }
        var conceptIds = jdbc.queryForList("select content_key, id from concept order by content_key");
        var questionIds = jdbc.queryForList("select content_key, id from question order by content_key");

        assertEquals(40, importChanged(corrected), "Expected all 40 canonical corrections");
        assertEquals(referenceRelations, jdbc.queryForObject("select count(*) from concept_reference", Long.class));
        assertEquals(1, learningQueryService.getConcept(conceptId).references().stream()
                .filter(ref -> "https://www.rfc-editor.org/rfc/rfc9846".equals(ref.url())).count());
        assertEquals(0, jdbc.queryForObject("select count(*) from ("
                + "select concept_id, reference_id from concept_reference "
                + "group by concept_id, reference_id having count(*) > 1) duplicates", Integer.class));

        int unchanged = 0;
        for (ImportSourceFile file : corrected) {
            var command = new ImportFilesCommand(List.of(file));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply(), () -> "Exact Preview: " + file.fileName());
            assertEquals(0, preview.errors());
            assertEquals(0, preview.updated(), file.fileName());
            unchanged += preview.unchanged();
            var repeat = applyService.apply(command, preview.previewDigest());
            assertEquals(0, repeat.updated());
            assertEquals(0, repeat.failed());
        }
        assertTrue(unchanged >= 40, "All changed files must be exact UNCHANGED on replay");

        var fullReimport = bootstrap.bootstrap();
        assertTrue(fullReimport.success(), () -> "Full exact reimport failed: " + fullReimport);
        assertEquals(3380, fullReimport.totals().unchanged());
        assertEquals(0, fullReimport.totals().errors());
        assertEquals(0, fullReimport.totals().failed());
        assertEquals(referenceRelations, jdbc.queryForObject("select count(*) from concept_reference", Long.class));
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept order by content_key"));
        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question order by content_key"));
        for (String table : historyTables) {
            assertEquals(history.get(table), jdbc.queryForList("select * from " + table + " order by 1"),
                    "Personal/history data must be unchanged: " + table);
        }
    }

    private int importChanged(List<ImportSourceFile> files) {
        int updated = 0;
        for (ImportSourceFile file : files) {
            var command = new ImportFilesCommand(List.of(file));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply(), () -> "Preview failed: " + file.fileName() + " " + preview);
            assertEquals(0, preview.errors());
            assertEquals(0, preview.created(), file.fileName());
            assertTrue(preview.updated() > 0, () -> "Expected changed content: " + file.fileName());
            var applied = applyService.apply(command, preview.previewDigest());
            assertEquals(0, applied.failed(), file.fileName());
            updated += applied.updated();
        }
        return updated;
    }
}
