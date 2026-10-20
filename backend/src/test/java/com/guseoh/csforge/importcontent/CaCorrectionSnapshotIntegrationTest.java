package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.importcontent.application.*;
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

/** PR #252 전용: 실제 구 main CA snapshot에서 교정본으로 변경해 개인 이력 불변을 검증한다. */
@Testcontainers
@SpringBootTest
class CaCorrectionSnapshotIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> PCATGRES =
            PostgresIntegrationTestSupport.container("csforge_ca_correction_snapshot_test");

    @Autowired CanonicalBootstrapService bootstrap;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, PCATGRES);
    }

    @Test
    void actualPreviousCaSnapshotToCorrectedPackIsIdempotentAndPreservesHistory() throws Exception {
        String baseline = System.getenv("CSFORGE_CA_BASELINE_DIR");
        assumeTrue(baseline != null && !baseline.isBlank(), "Runs in dedicated CA snapshot verification workflow");
        Path root = Path.of(baseline);
        assertTrue(Files.isDirectory(root));

        var first = bootstrap.bootstrap();
        assertTrue(first.success(), () -> "Initial corrected canonical bootstrap failed: " + first);
        assertEquals(0, first.totals().errors());

        List<ImportSourceFile> oldParts = new ArrayList<>();
        List<ImportSourceFile> correctedParts = new ArrayList<>();
        for (CanonicalContentFile file : contentSource.load()) {
            if (!file.path().startsWith("computer-architecture/")
                    || !(file.path().endsWith(".md") || file.path().endsWith("/questions.json"))) continue;
            String relative = file.path().substring("computer-architecture/".length());
            byte[] oldBytes = Files.readAllBytes(root.resolve(relative));
            if (!Arrays.equals(oldBytes, file.content())) {
                oldParts.add(new ImportSourceFile(file.path(), oldBytes));
                correctedParts.add(new ImportSourceFile(file.path(), file.content()));
            }
        }
        assertEquals(13, oldParts.size(), "Expected 7 concept Markdown and 6 question JSON files from PR #252");

        int reverted = 0;
        for (ImportSourceFile old : oldParts) {
            var command = new ImportFilesCommand(List.of(old));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply(), () -> "Old snapshot preview failed: " + old.fileName() + " " + preview);
            assertEquals(0, preview.errors());
            assertTrue(preview.updated() > 0, "No change for " + old.fileName());
            var result = applyService.apply(command, preview.previewDigest());
            reverted += result.updated();
        }
        assertEquals(14, reverted, "Expected 7 Concept and 7 Question updates");

        Long conceptId = jdbc.queryForObject(
                "select id from concept where content_key = ?",
                Long.class, "computer-architecture.core.io.non-blocking-io");
        Long questionId = jdbc.queryForObject(
                "select id from question where content_key = ?",
                Long.class, "computer-architecture.core.virtual-memory.page-fault.q1");
        Long selectedChoiceId = jdbc.queryForObject(
                "select id from question_choice where question_id=? and choice_key='D'", Long.class, questionId);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'CA correction history snapshot')", conceptId);
        Long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        Long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, selected_choice_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, ?, 'GRADED', true, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId, selectedChoiceId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, last_reviewed_at, last_processed_attempt_id) "
                + "values (?, 'SCHEDULED', 1, current_timestamp + interval '1 day', current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, stage_before, stage_after, reviewed_at, next_due_at) "
                + "values (?, ?, ?, 'WRONG', 1, 1, current_timestamp, current_timestamp + interval '1 day')",
                questionId, sessionId, attemptId);

        List<String> tables = List.of("personal_note", "attempt", "wrong_note",
                "review_schedule", "review_history", "quiz_session");
        List<List<Map<String, Object>>> history = tables.stream()
                .map(t -> jdbc.queryForList("select * from " + t + " order by 1")).toList();
        var questionIds = jdbc.queryForList("select content_key, id from question order by content_key");
        var conceptIds = jdbc.queryForList("select content_key, id from concept order by content_key");

        int updated = 0;
        int errors = 0;
        for (ImportSourceFile corrected : correctedParts) {
            var command = new ImportFilesCommand(List.of(corrected));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply(), () -> "Corrected preview failed: " + corrected.fileName() + " " + preview);
            errors += preview.errors();
            updated += applyService.apply(command, preview.previewDigest()).updated();
        }
        assertEquals(0, errors);
        assertEquals(14, updated);

        int unchanged = 0;
        for (ImportSourceFile corrected : correctedParts) {
            var command = new ImportFilesCommand(List.of(corrected));
            var preview = previewService.preview(command);
            assertTrue(preview.canApply());
            assertEquals(0, preview.errors());
            assertEquals(0, preview.updated(), corrected.fileName());
            unchanged += preview.unchanged();
            assertEquals(0, applyService.apply(command, preview.previewDigest()).updated());
        }
        assertEquals(112, unchanged, "All CA records from 7 MD and 6 question JSON files unchanged");

        var exact = bootstrap.bootstrap();
        assertTrue(exact.success(), () -> "Full canonical exact reimport failed: " + exact);
        assertEquals(first.totalItems(), exact.totals().unchanged());
        assertEquals(0, exact.totals().errors());

        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question order by content_key"));
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept order by content_key"));
        assertEquals(selectedChoiceId, jdbc.queryForObject(
                "select id from question_choice where question_id=? and choice_key='D'", Long.class, questionId));
        for (int i = 0; i < tables.size(); i++) {
            assertEquals(history.get(i), jdbc.queryForList("select * from " + tables.get(i) + " order by 1"),
                    () -> "Personal/history data changed during CA import");
        }
    }
}
