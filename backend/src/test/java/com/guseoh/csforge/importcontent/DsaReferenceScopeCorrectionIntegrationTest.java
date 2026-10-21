package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
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

/** Verifies DSA Reference-only changes do not recreate canonical entities or lose history. */
@Testcontainers
@SpringBootTest
class DsaReferenceScopeCorrectionIntegrationTest {
    private static final List<Correction> CORRECTIONS = List.of(
            new Correction("dsa.core.graph-path.floyd-warshall",
                    "dsa/graph-path/floyd-warshall.md",
                    "https://algs4.cs.princeton.edu/44sp/", "연습문항 11"),
            new Correction("dsa.core.sequential.doubly-linked-list",
                    "dsa/sequential/doubly-linked-list.md",
                    "https://algs4.cs.princeton.edu/13stacks/", "pre/post 센티널"),
            new Correction("dsa.core.stack-queue-deque.monotonic-stack-queue",
                    "dsa/stack-queue-deque/monotonic-stack-queue.md",
                    "https://algs4.cs.princeton.edu/13stacks/", "Web Exercises 62"),
            new Correction("dsa.core.algorithm-selection.preprocessing-query-cost",
                    "dsa/algorithm-selection/preprocessing-query-cost.md",
                    "https://algs4.cs.princeton.edu/14analysis/", "비용 모델"),
            new Correction("dsa.core.trees.binary-tree-traversal",
                    "dsa/trees/binary-tree-traversal.md",
                    "https://algs4.cs.princeton.edu/32bst/", "중위 순회"),
            new Correction("dsa.core.recursion-backtracking.recursion-call-state",
                    "dsa/recursion-backtracking/recursion-call-state.md",
                    "https://algs4.cs.princeton.edu/22mergesort/", "Top-down mergesort")
    );

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_dsa_reference_test");

    @Autowired CanonicalBootstrapService bootstrapService;
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
    void updatesSixNotesAndPreservesFullCanonicalImportAndPersonalHistory() {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical import: " + initial);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        Map<String, CanonicalContentFile> filesByPath = new LinkedHashMap<>();
        for (CanonicalContentFile file : contentSource.load()) {
            filesByPath.put(file.path(), file);
        }

        List<ImportSourceFile> oldFiles = new ArrayList<>();
        List<ImportSourceFile> updatedFiles = new ArrayList<>();
        Map<String, Long> conceptIds = new LinkedHashMap<>();
        Map<String, Long> referenceIds = new LinkedHashMap<>();
        Map<String, String> notes = new LinkedHashMap<>();

        for (Correction correction : CORRECTIONS) {
            CanonicalContentFile source = filesByPath.get(correction.path());
            assertTrue(source != null, () -> "Missing content file " + correction.path());
            String updated = new String(source.content(), StandardCharsets.UTF_8);
            int start = updated.indexOf("    relationNote: \"");
            assertTrue(start >= 0, () -> "Missing relationNote in " + correction.path());
            int lineEnd = updated.indexOf('\n', start);
            assertTrue(lineEnd > start);
            String line = updated.substring(start, lineEnd + 1);
            String note = line.substring("    relationNote: \"".length(), line.length() - 2);
            assertTrue(note.contains(correction.expectedSnippet()), () -> "Incorrect note " + correction.key());
            String historical = updated.replace(line, "");
            assertFalse(historical.equals(updated));
            assertEquals(body(historical), body(updated), "Concept body must remain unchanged");
            assertTrue(historical.contains("url: \"" + correction.url() + "\""));
            oldFiles.add(source(correction.path(), historical));
            updatedFiles.add(source(correction.path(), updated));

            long id = jdbc.queryForObject(
                    "select id from concept where content_key=?", Long.class, correction.key());
            conceptIds.put(correction.key(), id);
            referenceIds.put(correction.key(), referenceId(id, correction.url()));
            notes.put(correction.key(), note);
        }

        ImportFilesCommand historical = new ImportFilesCommand(oldFiles);
        var historicalPreview = previewService.preview(historical);
        assertTrue(historicalPreview.canApply(), () -> "Old Reference preview: " + historicalPreview);
        assertEquals(0, historicalPreview.errors());
        assertEquals(6, historicalPreview.updated());
        assertEquals(6, applyService.apply(historical, historicalPreview.previewDigest()).updated());

        for (Correction correction : CORRECTIONS) {
            long id = conceptIds.get(correction.key());
            assertEquals(referenceIds.get(correction.key()), referenceId(id, correction.url()));
            assertTrue(learningQueryService.getConcept(id).references().stream()
                    .anyMatch(ref -> ref.url().equals(correction.url())
                            && (ref.relationNote() == null || ref.relationNote().isBlank())));
            jdbc.update("insert into personal_note (concept_id, content) values (?, ?)",
                    id, "DSA R2: " + correction.key());
        }

        long questionId = jdbc.queryForObject("select id from question order by id limit 1", Long.class);
        long quizId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, quizId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        List<Map<String, Object>> personalBefore = jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attemptsBefore = jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrongBefore = jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand corrected = new ImportFilesCommand(updatedFiles);
        var preview = previewService.preview(corrected);
        assertTrue(preview.canApply(), () -> "Corrected Reference preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(0, preview.created());
        assertEquals(6, preview.updated());
        assertEquals(6, applyService.apply(corrected, preview.previewDigest()).updated());

        for (Correction correction : CORRECTIONS) {
            long id = conceptIds.get(correction.key());
            assertEquals(id, jdbc.queryForObject("select id from concept where content_key=?", Long.class, correction.key()));
            assertEquals(referenceIds.get(correction.key()), referenceId(id, correction.url()));
            assertEquals(1, jdbc.queryForObject(
                    "select count(*) from concept_reference cr join reference r on r.id=cr.reference_id "
                            + "where cr.concept_id=? and r.url=?", Integer.class, id, correction.url()));
            assertTrue(learningQueryService.getConcept(id).references().stream()
                    .anyMatch(ref -> ref.url().equals(correction.url())
                            && notes.get(correction.key()).equals(ref.relationNote())));
        }
        assertEquals(personalBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full-pack exact reimport: " + repeated);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(personalBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private long referenceId(long conceptId, String url) {
        return jdbc.queryForObject(
                "select r.id from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?", Long.class, conceptId, url);
    }

    private static String body(String markdown) {
        int boundary = markdown.indexOf("\n---\n", 4);
        assertTrue(boundary > 0);
        return markdown.substring(boundary);
    }

    private static ImportSourceFile source(String path, String markdown) {
        return new ImportSourceFile(path, markdown.getBytes(StandardCharsets.UTF_8));
    }

    private record Correction(String key, String path, String url, String expectedSnippet) { }
}
