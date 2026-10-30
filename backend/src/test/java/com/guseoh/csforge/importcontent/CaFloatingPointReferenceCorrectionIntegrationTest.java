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

/** Ensures IEEE Reference correction keeps the floating-point Concept and personal history stable. */
@Testcontainers
@SpringBootTest
class CaFloatingPointReferenceCorrectionIntegrationTest {
    private static final String KEY = "computer-architecture.core.data-representation.floating-point";
    private static final String PATH = "computer-architecture/data-representation/floating-point.md";
    private static final String OLD_URL = "https://ieeexplore.ieee.org/document/8766227";
    private static final String IEEE_URL = "https://standards.ieee.org/ieee/754/6210/";
    private static final String ORACLE_URL =
            "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html";

    private static final String OLD_BLOCK = """
              - url: "https://ieeexplore.ieee.org/document/8766227"
                title: "IEEE Standard for Floating-Point Arithmetic"
                referenceType: OFFICIAL
                language: en
                depth: section
                recommendation: "부동소수점의 표현 폭과 반올림 경계를 확인한다."
                displayOrder: 1
            """;

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_ca_ieee754_reference_test");

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
    void replacesIEEEPublicationNumberAndAddsReadableFormatSourceWithoutLosingHistory() {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical bootstrap: " + initial);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        CanonicalContentFile input = contentSource.load().stream()
                .filter(file -> file.path().equals(PATH)).findFirst().orElseThrow();
        String corrected = new String(input.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
        int start = corrected.indexOf("\nreferences:\n");
        int end = corrected.indexOf("\n---\n", 4);
        assertTrue(start >= 0 && end > start, "Missing frontmatter references block");
        String newReferenceBlock = corrected.substring(start + 1, end);
        assertTrue(newReferenceBlock.contains(IEEE_URL));
        assertTrue(newReferenceBlock.contains(ORACLE_URL));
        assertFalse(corrected.contains(OLD_URL));
        String historical = corrected.substring(0, start + 1) + "references:\n" + OLD_BLOCK
                + corrected.substring(end);
        assertEquals(corrected.substring(end), historical.substring(historical.indexOf("\n---\n", 4)),
                "Concept body must remain unchanged");
        assertTrue(historical.contains(OLD_URL));

        long id = jdbc.queryForObject("select id from concept where content_key=?", Long.class, KEY);
        ImportFilesCommand past = command(historical);
        var previous = previewService.preview(past);
        assertTrue(previous.canApply(), () -> "Old Reference Preview: " + previous);
        assertEquals(0, previous.errors());
        assertEquals(1, previous.updated());
        assertEquals(1, applyService.apply(past, previous.previewDigest()).updated());
        assertEquals(1, linkedCount(id, OLD_URL));

        jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 IEEE history')", id);
        long questionId = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, KEY + ".%");
        long quizId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, quizId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                        + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)",
                questionId, attemptId);
        List<Map<String, Object>> personalBefore = jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attemptBefore = jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrongBefore = jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand current = command(corrected);
        var preview = previewService.preview(current);
        assertTrue(preview.canApply(), () -> "Corrected Reference Preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(0, preview.created());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(current, preview.previewDigest()).updated());
        assertEquals(id, jdbc.queryForObject("select id from concept where content_key=?", Long.class, KEY));
        assertEquals(0, linkedCount(id, OLD_URL));
        assertEquals(1, linkedCount(id, IEEE_URL));
        assertEquals(1, linkedCount(id, ORACLE_URL));

        var references = learningQueryService.getConcept(id).references();
        assertEquals(2, references.size());
        assertTrue(references.stream().anyMatch(ref -> ref.url().equals(IEEE_URL)
                && ref.title().contains("754-2019") && ref.relationNote().contains("표준 범위")));
        assertTrue(references.stream().anyMatch(ref -> ref.url().equals(ORACLE_URL)
                && ref.relationNote().contains("1985")));
        assertEquals(personalBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult reimport = bootstrapService.bootstrap();
        assertTrue(reimport.success(), () -> "Full canonical exact reimport: " + reimport);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, reimport.totals().unchanged());
        assertEquals(0, reimport.totals().errors());
        assertEquals(0, reimport.totals().failed());
        assertEquals(personalBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private int linkedCount(long id, String url) {
        return jdbc.queryForObject(
                "select count(*) from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?", Integer.class, id, url);
    }

    private static ImportFilesCommand command(String markdown) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(
                PATH, markdown.getBytes(StandardCharsets.UTF_8))));
    }
}
