package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
import tools.jackson.databind.ObjectMapper;

/** UMD 44관계 교정의 한 번 적용·재가져오기와 canonical identity·학습 이력 보존을 검증한다. */
@Testcontainers
@SpringBootTest
class CaReadableReferencesIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_ca_readable_references");

    @Autowired CanonicalBootstrapService bootstrapService;
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
    void replacesOrConsolidatesAll44RelationsWithoutLosingIdentityOrHistory() throws Exception {
        var first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "Bootstrap: " + first);
        assertEquals(3380, first.totalItems());
        assertEquals(0, first.totals().errors());

        HistoricalReference[] historical;
        try (var input = getClass().getResourceAsStream(
                "/content-corrections/umd-historical-references.json")) {
            assertNotNull(input);
            historical = objectMapper.readValue(input.readAllBytes(), HistoricalReference[].class);
        }
        assertEquals(44, historical.length);
        Map<String, CanonicalContentFile> canonical = contentSource.load().stream()
                .collect(Collectors.toMap(CanonicalContentFile::path, Function.identity()));
        List<ImportSourceFile> beforeFiles = new ArrayList<>();
        List<ImportSourceFile> afterFiles = new ArrayList<>();
        for (HistoricalReference entry : historical) {
            var source = canonical.get(entry.path());
            assertNotNull(source);
            String after = new String(source.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
            int start = after.indexOf("references:\n");
            int end = after.indexOf("\n---\n", start);
            assertTrue(start > 0 && end > start);
            String before = after.substring(0, start) + entry.references() + after.substring(end);
            assertEquals(before.substring(before.indexOf("\n---\n", 4)), after.substring(end));
            assertFalse(after.contains(entry.oldUrl()));
            beforeFiles.add(file(entry.path(), before));
            afterFiles.add(file(entry.path(), after));
        }
        var past = new ImportFilesCommand(beforeFiles);
        var pastPreview = previewService.preview(past);
        assertTrue(pastPreview.canApply(), () -> "Historical preview: " + pastPreview);
        assertEquals(0, pastPreview.errors());
        assertEquals(44, pastPreview.updated());
        assertEquals(44, applyService.apply(past, pastPreview.previewDigest()).updated());

        var conceptIds = jdbc.queryForList("select content_key, id from concept order by id");
        var questionIds = jdbc.queryForList("select content_key, id from question order by id");
        var referenceIds = jdbc.queryForList("select url, id from reference order by id");
        for (HistoricalReference entry : historical) {
            long id = jdbc.queryForObject("select id from concept where content_key=?", Long.class, entry.key());
            jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 UMD private note')", id);
        }
        long question = jdbc.queryForObject("select id from question order by id limit 1", Long.class);
        long session = jdbc.queryForObject("insert into quiz_session (started_at, source) "
                + "values (current_timestamp, 'REVIEW') returning id", Long.class);
        long attempt = jdbc.queryForObject("insert into attempt (quiz_session_id, question_id, grading_status, "
                + "correct, answered_at, graded_at) values (?, ?, 'GRADED', false, current_timestamp, "
                + "current_timestamp) returning id", Long.class, session, question);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, "
                + "last_wrong_at, last_wrong_attempt_id) values (?, 'ACTIVE', 1, current_timestamp, "
                + "current_timestamp, ?)", question, attempt);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, last_processed_attempt_id) "
                + "values (?, 'SCHEDULED', 1, current_timestamp + interval '1 day', ?)", question, attempt);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, "
                + "stage_before, stage_after, reviewed_at, next_due_at) values (?, ?, ?, 'WRONG', 2, 1, "
                + "current_timestamp, current_timestamp + interval '1 day')", question, session, attempt);
        Map<String, List<Map<String, Object>>> history = history();

        var corrected = new ImportFilesCommand(afterFiles);
        var preview = previewService.preview(corrected);
        assertTrue(preview.canApply(), () -> "Corrected preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(44, preview.updated());
        assertEquals(44, applyService.apply(corrected, preview.previewDigest()).updated());
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept order by id"));
        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question order by id"));
        for (var reference : referenceIds) {
            if (!reference.get("url").toString().contains("www.cs.umd.edu/~meesh/")) {
                assertEquals(reference.get("id"), jdbc.queryForObject(
                        "select id from reference where url=?", Long.class, reference.get("url")));
            }
        }
        for (HistoricalReference entry : historical) {
            long id = jdbc.queryForObject("select id from concept where content_key=?", Long.class, entry.key());
            var displayed = learningQueryService.getConcept(id).references();
            assertFalse(displayed.isEmpty());
            assertTrue(displayed.stream().noneMatch(ref -> ref.url().equals(entry.oldUrl())));
            assertTrue(displayed.stream().anyMatch(ref -> ref.relationNote() != null && !ref.relationNote().isBlank()));
        }
        assertEquals(0, jdbc.queryForObject("select count(*) from (select concept_id, reference_id "
                + "from concept_reference group by concept_id, reference_id having count(*)>1) duplicates", Integer.class));
        assertEquals(history, history());
        var repeatedPreview = previewService.preview(corrected);
        assertEquals(44, repeatedPreview.unchanged());
        assertEquals(0, repeatedPreview.updated());
        var repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full exact reimport: " + repeated);
        assertEquals(3380, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(history, history());
    }

    private Map<String, List<Map<String, Object>>> history() {
        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        for (String table : List.of("personal_note", "quiz_session", "attempt", "wrong_note", "review_history")) {
            result.put(table, jdbc.queryForList("select * from " + table + " order by id"));
        }
        result.put("review_schedule", jdbc.queryForList("select * from review_schedule order by question_id"));
        return result;
    }

    private static ImportSourceFile file(String path, String markdown) {
        return new ImportSourceFile(path, markdown.getBytes(StandardCharsets.UTF_8));
    }

    private record HistoricalReference(String path, String key, String references, String oldUrl) {}
}
