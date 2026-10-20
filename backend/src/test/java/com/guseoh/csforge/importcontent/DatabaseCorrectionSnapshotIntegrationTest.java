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

/** Verifies Issue #202 Database corrections against the actual pre-PR canonical pack. */
@Testcontainers
@SpringBootTest
class DatabaseCorrectionSnapshotIntegrationTest {
    private static final String BASELINE_ENV = "CSFORGE_DATABASE_BASELINE_DIR";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_database_correction_snapshot");

    @Autowired CanonicalBootstrapService bootstrap;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void oldDatabasePackToCorrectedPackPreservesHistoryAndIsIdempotent() throws Exception {
        String baseline = System.getenv(BASELINE_ENV);
        assumeTrue(baseline != null && !baseline.isBlank(),
                "Dedicated Database correction regression workflow only");
        Path baselineRoot = Path.of(baseline);
        assertTrue(Files.isDirectory(baselineRoot), "Pre-PR Database pack missing");

        var initial = bootstrap.bootstrap();
        assertTrue(initial.success(), () -> "Corrected bootstrap failed: " + initial);
        assertEquals(3380, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        long originalRelations = jdbc.queryForObject("select count(*) from concept_reference", Long.class);
        List<ImportSourceFile> old = new ArrayList<>();
        List<ImportSourceFile> corrected = new ArrayList<>();
        for (CanonicalContentFile file : contentSource.load()) {
            if (!file.path().startsWith("database/")
                    || !(file.path().endsWith(".md") || file.path().endsWith("/questions.json"))) {
                continue;
            }
            Path relative = Path.of(file.path().substring("database/".length()));
            byte[] previousBytes = Files.readAllBytes(baselineRoot.resolve(relative));
            if (Arrays.equals(previousBytes, file.content())) continue;
            old.add(new ImportSourceFile(file.path(), previousBytes));
            corrected.add(new ImportSourceFile(file.path(), file.content()));
        }
        assertEquals(10, old.size(), "Expected six Concept MD and four Question JSON files");
        assertEquals(10, applyChanged(old), "Previous Database snapshot");

        long conceptId = jdbc.queryForObject("select id from concept where content_key = ?",
                Long.class, "database.core.mvcc.visibility");
        long questionId = jdbc.queryForObject("select id from question where content_key = ?",
                Long.class, "database.core.sql.select-order.q1");
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'Database import correction history')",
                conceptId);
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, "
                + "last_wrong_at, last_wrong_attempt_id) values (?, 'ACTIVE', 1, current_timestamp, "
                + "current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, last_reviewed_at, "
                + "last_processed_attempt_id) values (?, 'SCHEDULED', 1, "
                + "current_timestamp + interval '1 day', current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, "
                + "stage_before, stage_after, reviewed_at, next_due_at) values (?, ?, ?, 'WRONG', 1, 1, "
                + "current_timestamp, current_timestamp + interval '1 day')", questionId, sessionId, attemptId);

        var conceptIds = jdbc.queryForList("select content_key, id from concept order by content_key");
        var questionIds = jdbc.queryForList("select content_key, id from question order by content_key");
        List<String> historyTables = List.of("personal_note", "quiz_session", "attempt", "wrong_note",
                "review_schedule", "review_history", "concept_progress");
        Map<String, List<Map<String, Object>>> history = new LinkedHashMap<>();
        for (String table : historyTables) {
            history.put(table, jdbc.queryForList("select * from " + table + " order by 1"));
        }

        assertEquals(10, applyChanged(corrected), "Updated Database canonical pack");
        assertEquals(originalRelations, jdbc.queryForObject("select count(*) from concept_reference", Long.class));

        int unchanged = 0;
        for (ImportSourceFile file : corrected) {
            var command = new ImportFilesCommand(List.of(file));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply(), () -> "Exact preview: " + file.fileName());
            assertEquals(0, preview.errors());
            assertEquals(0, preview.created());
            assertEquals(0, preview.updated(), file.fileName());
            unchanged += preview.unchanged();
            var repeated = applyService.apply(command, preview.previewDigest());
            assertEquals(0, repeated.updated());
            assertEquals(0, repeated.failed());
        }
        assertTrue(unchanged >= 10, "All corrected records must be unchanged on exact replay");

        var full = bootstrap.bootstrap();
        assertTrue(full.success(), () -> "Full exact reimport failed: " + full);
        assertEquals(3380, full.totals().unchanged());
        assertEquals(0, full.totals().errors());
        assertEquals(0, full.totals().failed());
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept order by content_key"));
        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question order by content_key"));
        assertEquals(originalRelations, jdbc.queryForObject("select count(*) from concept_reference", Long.class));
        for (String table : historyTables) {
            assertEquals(history.get(table), jdbc.queryForList("select * from " + table + " order by 1"),
                    "History was changed by Database import: " + table);
        }
    }

    private int applyChanged(List<ImportSourceFile> files) {
        int updated = 0;
        for (ImportSourceFile file : files) {
            var command = new ImportFilesCommand(List.of(file));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply(), () -> "Cannot apply " + file.fileName() + ": " + preview);
            assertEquals(0, preview.errors());
            assertEquals(0, preview.created());
            assertEquals(1, preview.updated(), file.fileName());
            var applied = applyService.apply(command, preview.previewDigest());
            assertEquals(0, applied.failed());
            updated += applied.updated();
        }
        return updated;
    }
}
