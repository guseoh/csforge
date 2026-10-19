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

/** Replays both R2 reference corrections together from the historical 45-concept baseline. */
@Testcontainers
@SpringBootTest
class R2Remaining45CombinedIntegrationTest {
    private static final String CAP_PATH = "distributed-systems/coordination/cap-tradeoffs.md";
    private static final String CAP_KEY = "distributed.core.coordination.cap-tradeoffs";
    private static final String MIT = "https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer6.pdf";
    private static final String CAP_OLD_NOTE =
            "CAP 절충을 정식화한 논문의 일관성·가용성·네트워크 분할 정의 확인";
    private static final String CAP_NEW_NOTE =
            "출판 서지·DOI 확인용(ACM SIGACT News 33(2), 2002). "
                    + "정의·정리 본문은 MIT 저자 원고에서 읽는다. ACM 출판본 전문은 직접 검증하지 못했다.";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_remaining45_combined");

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
    void appliesAll45TogetherOnceAndPreservesLearningHistory() throws Exception {
        var bootstrap = bootstrapService.bootstrap();
        assertTrue(bootstrap.success(), () -> "Bootstrap: " + bootstrap);
        assertEquals(3380, bootstrap.totalItems());
        assertEquals(0, bootstrap.totals().errors());

        HistoricalReference[] historical;
        try (var input = getClass().getResourceAsStream(
                "/content-corrections/umd-historical-references.json")) {
            assertNotNull(input);
            historical = objectMapper.readValue(input.readAllBytes(), HistoricalReference[].class);
        }
        assertEquals(44, historical.length);
        Map<String, CanonicalContentFile> sources = contentSource.load().stream()
                .collect(Collectors.toMap(CanonicalContentFile::path, Function.identity()));
        List<ImportSourceFile> originals = new ArrayList<>();
        List<ImportSourceFile> corrected = new ArrayList<>();
        for (HistoricalReference entry : historical) {
            String next = normalize(sources.get(entry.path()));
            int start = next.indexOf("references:\n");
            int end = next.indexOf("\n---\n", start);
            assertTrue(start > 0 && end > start, entry.path());
            String prior = next.substring(0, start) + entry.references() + next.substring(end);
            assertEquals(prior.substring(prior.indexOf("\n---\n", 4)), next.substring(end));
            assertFalse(next.contains(entry.oldUrl()));
            originals.add(file(entry.path(), prior));
            corrected.add(file(entry.path(), next));
        }

        String nextCap = normalize(sources.get(CAP_PATH));
        int manuscript = nextCap.indexOf("  - url: \"" + MIT + "\"");
        int body = nextCap.indexOf("\n---\n", 4);
        assertTrue(manuscript > 0 && body > manuscript);
        String priorCap = (nextCap.substring(0, manuscript).stripTrailing()
                + nextCap.substring(body)).replace(CAP_NEW_NOTE, CAP_OLD_NOTE);
        assertFalse(priorCap.contains(MIT));
        assertEquals(nextCap.substring(body), priorCap.substring(priorCap.indexOf("\n---\n", 4)));
        originals.add(file(CAP_PATH, priorCap));
        corrected.add(file(CAP_PATH, nextCap));
        assertEquals(45, originals.size());
        assertEquals(45, corrected.size());

        var restore = new ImportFilesCommand(originals);
        var restorePreview = previewService.preview(restore);
        assertTrue(restorePreview.canApply(), () -> "Historical preview: " + restorePreview);
        assertEquals(0, restorePreview.errors());
        assertEquals(45, restorePreview.updated());
        assertEquals(45, applyService.apply(restore, restorePreview.previewDigest()).updated());

        var conceptIds = jdbc.queryForList("select content_key, id from concept order by id");
        var questionIds = jdbc.queryForList("select content_key, id from question order by id");
        var references = jdbc.queryForList("select url, id from reference order by id");
        long concept = jdbc.queryForObject("select id from concept where content_key=?", Long.class, CAP_KEY);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'Combined R2 private note')", concept);
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

        var allChanges = new ImportFilesCommand(corrected);
        var preview = previewService.preview(allChanges);
        assertTrue(preview.canApply(), () -> "Combined preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(45, preview.updated());
        assertEquals(0, preview.unchanged());
        var applied = applyService.apply(allChanges, preview.previewDigest());
        assertEquals(45, applied.updated());
        assertEquals(0, applied.failed());
        assertEquals(conceptIds, jdbc.queryForList("select content_key, id from concept order by id"));
        assertEquals(questionIds, jdbc.queryForList("select content_key, id from question order by id"));
        for (var previous : references) {
            String url = previous.get("url").toString();
            if (!url.contains("www.cs.umd.edu/~meesh/")) {
                assertEquals(previous.get("id"),
                        jdbc.queryForObject("select id from reference where url=?", Long.class, url));
            }
        }
        long totalRelations = jdbc.queryForObject("select count(*) from concept_reference", Long.class);
        assertEquals(1038L, totalRelations);
        assertEquals(0, jdbc.queryForObject("select count(*) from (select concept_id, reference_id "
                + "from concept_reference group by concept_id, reference_id having count(*)>1) duplicates", Integer.class));
        assertEquals(3, learningQueryService.getConcept(concept).references().size());
        assertTrue(learningQueryService.getConcept(concept).references().stream()
                .anyMatch(r -> r.url().equals(MIT)));
        assertEquals(history, history());

        var repeatPreview = previewService.preview(allChanges);
        assertEquals(45, repeatPreview.unchanged());
        assertEquals(0, repeatPreview.updated());
        var repeatApply = applyService.apply(allChanges, repeatPreview.previewDigest());
        assertEquals(45, repeatApply.unchanged());
        assertEquals(0, repeatApply.updated());
        assertEquals(0, repeatApply.failed());
        var exact = bootstrapService.bootstrap();
        assertTrue(exact.success(), () -> "Full exact reimport: " + exact);
        assertEquals(3380, exact.totals().unchanged());
        assertEquals(0, exact.totals().errors());
        assertEquals(0, exact.totals().failed());
        assertEquals(history, history());
    }

    private static String normalize(CanonicalContentFile source) {
        assertNotNull(source);
        return new String(source.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
    }

    private Map<String, List<Map<String, Object>>> history() {
        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        for (String name : List.of("personal_note", "quiz_session", "attempt", "wrong_note",
                "review_history", "concept_progress")) {
            result.put(name, jdbc.queryForList("select * from " + name + " order by 1"));
        }
        result.put("review_schedule", jdbc.queryForList("select * from review_schedule order by question_id"));
        return result;
    }

    private static ImportSourceFile file(String path, String markdown) {
        return new ImportSourceFile(path, markdown.getBytes(StandardCharsets.UTF_8));
    }

    private record HistoricalReference(String path, String key, String references, String oldUrl) {}
}
