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

/** The three cookie references migrate from an unpublished RFC URL without losing user history. */
@Testcontainers
@SpringBootTest
class NetworkCookieReferenceCorrectionIntegrationTest {
    private static final String OLD_URL = "https://www.rfc-editor.org/rfc/rfc10025.html";
    private static final String PUBLISHED_URL = "https://www.rfc-editor.org/rfc/rfc6265.html";
    private static final String DRAFT_URL =
            "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html";
    private static final String PREFIX = "network-http.core.http-state-intermediary.";
    private static final List<String> CONCEPTS = List.of("cookie", "set-cookie", "cookie-scope");

    private static final String OLD_REFERENCES = """
            references:
              - url: "https://www.rfc-editor.org/rfc/rfc10025.html"
                title: "Cookies: HTTP State Management Mechanism"
                referenceType: OFFICIAL
                language: en
                depth: section
                recommendation: "Cookie·Set-Cookie 필드 문법과 사용자 에이전트의 저장·전송 규칙을 확인한다."
                displayOrder: 1
            """;

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_cookie_reference_test");

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
    void threePublishedAndDraftReferenceCorrectionsPreserveHistoryAndReimport() {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical bootstrap: " + initial);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        Map<String, CanonicalContentFile> canonical = new LinkedHashMap<>();
        for (CanonicalContentFile file : contentSource.load()) canonical.put(file.path(), file);
        List<ImportSourceFile> oldFiles = new ArrayList<>();
        List<ImportSourceFile> correctedFiles = new ArrayList<>();
        Map<String, Long> ids = new LinkedHashMap<>();

        for (String name : CONCEPTS) {
            String contentKey = PREFIX + name;
            long conceptId = jdbc.queryForObject(
                    "select id from concept where content_key = ?", Long.class, contentKey);
            ids.put(contentKey, conceptId);
            String filePath = "network-http/http-state-intermediary/" + name + ".md";
            CanonicalContentFile file = canonical.get(filePath);
            assertTrue(file != null, "Missing canonical file " + filePath);
            String corrected = new String(file.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
            int start = corrected.indexOf("references:\n");
            int closing = corrected.indexOf("\n---\n", start);
            assertTrue(start >= 0 && closing > start);
            assertTrue(corrected.substring(start, closing).contains(PUBLISHED_URL));
            assertTrue(corrected.substring(start, closing).contains(DRAFT_URL));
            String historical = corrected.substring(0, start) + OLD_REFERENCES
                    + corrected.substring(closing);
            assertFalse(historical.equals(corrected));
            assertEquals(corrected.substring(closing), historical.substring(
                    historical.indexOf("\n---\n", start)), "Body was altered: " + filePath);
            oldFiles.add(file(filePath, historical));
            correctedFiles.add(file(filePath, corrected));
        }

        ImportFilesCommand previous = new ImportFilesCommand(oldFiles);
        var previousPreview = previewService.preview(previous);
        assertTrue(previousPreview.canApply(), () -> "Old reference preview: " + previousPreview);
        assertEquals(0, previousPreview.errors());
        assertEquals(3, previousPreview.updated());
        assertEquals(3, applyService.apply(previous, previousPreview.previewDigest()).updated());

        for (String contentKey : ids.keySet()) {
            assertEquals(1, linkedUrlCount(ids.get(contentKey), OLD_URL));
            jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 reference note')",
                    ids.get(contentKey));
        }
        long questionId = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, PREFIX + "%");
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        List<Map<String, Object>> notesBefore =
                jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attemptsBefore =
                jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrongBefore =
                jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand current = new ImportFilesCommand(correctedFiles);
        var preview = previewService.preview(current);
        assertTrue(preview.canApply(), () -> "Corrected reference preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(0, preview.created());
        assertEquals(3, preview.updated());
        assertEquals(3, applyService.apply(current, preview.previewDigest()).updated());

        for (Map.Entry<String, Long> concept : ids.entrySet()) {
            long conceptId = jdbc.queryForObject(
                    "select id from concept where content_key = ?", Long.class, concept.getKey());
            assertEquals(concept.getValue(), conceptId);
            assertEquals(0, linkedUrlCount(conceptId, OLD_URL));
            assertEquals(1, linkedUrlCount(conceptId, PUBLISHED_URL));
            assertEquals(1, linkedUrlCount(conceptId, DRAFT_URL));
            var references = learningQueryService.getConcept(conceptId).references();
            assertEquals(2, references.size());
            assertTrue(references.stream().anyMatch(ref ->
                    ref.url().equals(PUBLISHED_URL) && ref.title().contains("RFC 6265")));
            assertTrue(references.stream().anyMatch(ref ->
                    ref.url().equals(DRAFT_URL) && ref.title().contains("Internet-Draft")
                            && ref.relationNote() != null));
        }
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full-pack reimport: " + repeated);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private int linkedUrlCount(long conceptId, String url) {
        return jdbc.queryForObject(
                "select count(*) from concept_reference cr "
                        + "join reference r on r.id = cr.reference_id "
                        + "where cr.concept_id = ? and r.url = ?",
                Integer.class, conceptId, url);
    }

    private static ImportSourceFile file(String path, String content) {
        return new ImportSourceFile(path, content.getBytes(StandardCharsets.UTF_8));
    }
}
