package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
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

/** Updating the JMH reading URL must retain canonical identity and private study history. */
@Testcontainers
@SpringBootTest
class CaJmhReferenceCorrectionIntegrationTest {
    private static final String KEY = "computer-architecture.core.performance.microbenchmark-boundary";
    private static final String PATH = "computer-architecture/performance/microbenchmark-boundary.md";
    private static final String OLD_URL = "https://openjdk.org/projects/code-tools/jmh/";
    private static final String NEW_URL = "https://github.com/openjdk/jmh";
    private static final String OLD_BLOCK = """
              - url: "https://openjdk.org/projects/code-tools/jmh/"
                title: "OpenJDK JMH"
                referenceType: OFFICIAL
                language: en
                depth: section
                recommendation: "JVM microbenchmark를 설계할 때 전용 harness를 사용하는 이유와 측정 경계를 확인한다."
                displayOrder: 1
            """;

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_ca_jmh_reference_test");

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
    void changesJmhLearningUrlWhileKeepingReferenceIdAndPersonalHistory() {
        CanonicalBootstrapExecutionResult first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "Initial bootstrap: " + first);
        assertEquals(3380, first.totalItems());
        assertEquals(0, first.totals().errors());

        CanonicalContentFile file = contentSource.load().stream()
                .filter(entry -> entry.path().equals(PATH)).findFirst().orElseThrow();
        String corrected = new String(file.content(), StandardCharsets.UTF_8);
        assertTrue(corrected.contains(NEW_URL));
        assertTrue(corrected.contains("relationNote:"));
        assertFalse(corrected.contains(OLD_URL));
        int refs = corrected.indexOf("\nreferences:\n");
        int boundary = corrected.indexOf("\n---\n", 4);
        assertTrue(refs >= 0 && boundary > refs);
        String historical = corrected.substring(0, refs + 1) + "references:\n" + OLD_BLOCK
                + corrected.substring(boundary);
        assertTrue(historical.contains(OLD_URL));
        assertEquals(corrected.substring(boundary),
                historical.substring(historical.indexOf("\n---\n", 4)),
                "Concept body must not change in Reference correction");

        long conceptId = jdbc.queryForObject(
                "select id from concept where content_key = ?", Long.class, KEY);
        ImportFilesCommand past = command(historical);
        var originalPreview = previewService.preview(past);
        assertTrue(originalPreview.canApply(), () -> "Old preview: " + originalPreview);
        assertEquals(0, originalPreview.errors());
        assertEquals(1, originalPreview.updated());
        assertEquals(1, applyService.apply(past, originalPreview.previewDigest()).updated());
        assertEquals(1, linkedCount(conceptId, OLD_URL));
        long globalReferenceIdBefore = referenceId(conceptId, OLD_URL);

        jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 JMH history')",
                conceptId);
        long questionId = jdbc.queryForObject(
                "select id from question order by id limit 1", Long.class);
        long quizSessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, quizSessionId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                        + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        List<Map<String, Object>> notesBefore = jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attemptsBefore = jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrongBefore = jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand command = command(corrected);
        var preview = previewService.preview(command);
        assertTrue(preview.canApply(), () -> "Updated preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(command, preview.previewDigest()).updated());
        assertEquals(conceptId, jdbc.queryForObject(
                "select id from concept where content_key = ?", Long.class, KEY));
        assertEquals(0, linkedCount(conceptId, OLD_URL));
        assertEquals(1, linkedCount(conceptId, NEW_URL));
        assertTrue(globalReferenceIdBefore > 0);
        var shown = learningQueryService.getConcept(conceptId).references();
        assertEquals(1, shown.size());
        assertTrue(shown.stream().anyMatch(ref -> ref.url().equals(NEW_URL)
                && ref.title().contains("OpenJDK JMH")
                && ref.relationNote().contains("Basic Considerations")));
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full canonical exact reimport: " + repeated);
        assertEquals(3380, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private int linkedCount(long conceptId, String url) {
        return jdbc.queryForObject("select count(*) from concept_reference cr join reference r "
                + "on r.id=cr.reference_id where cr.concept_id=? and r.url=?",
                Integer.class, conceptId, url);
    }

    private long referenceId(long conceptId, String url) {
        return jdbc.queryForObject("select r.id from concept_reference cr join reference r "
                + "on r.id=cr.reference_id where cr.concept_id=? and r.url=?",
                Long.class, conceptId, url);
    }

    private static ImportFilesCommand command(String markdown) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(
                PATH, markdown.getBytes(StandardCharsets.UTF_8))));
    }
}
