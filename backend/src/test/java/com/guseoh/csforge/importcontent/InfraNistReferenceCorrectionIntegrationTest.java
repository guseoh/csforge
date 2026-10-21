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

/** Updating withdrawn NIST guidance must preserve the canonical Concept and personal learning history. */
@Testcontainers
@SpringBootTest
class InfraNistReferenceCorrectionIntegrationTest {
    private static final String KEY = "infrastructure.core.reliability.backup-restore";
    private static final String PATH = "infrastructure-cloud/reliability/backup-restore.md";
    private static final String OLD_URL = "https://csrc.nist.gov/pubs/sp/800/34/r1/final";
    private static final String NEW_URL = "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final";
    private static final String PG_URL =
            "https://www.postgresql.org/docs/current/continuous-archiving.html";

    private static final String OLD_NIST = """
              - url: "https://csrc.nist.gov/pubs/sp/800/34/r1/final"
                title: "NIST SP 800-34 Rev. 1: Contingency Planning Guide"
                referenceType: OFFICIAL
                language: en
                depth: section
                recommendation: "정보시스템의 contingency·복구 계획과 테스트 절차를 확인한다."
                displayOrder: 1
                relationNote: "백업·복구 계획과 복구 절차 확인"
            """;
    private static final String NEW_NIST = """
              - url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final"
                title: "NIST SP 800-34 Rev. 1 (2010 Updated): Contingency Planning Guide"
                referenceType: OFFICIAL
                language: en
                depth: section
                recommendation: "2010년 갱신된 정식 NIST 지침에서 재해 복구·비상계획 수립과 복구 절차 검증을 읽는다. 특정 서비스의 현재 운영 기준이나 RPO/RTO 목표를 대신하는 것은 아니다."
                displayOrder: 1
                relationNote: "시스템별 복구 우선순위, 대체 처리·복구 절차 및 정기 시험 근거를 확인한다. 종전 /r1/final은 Withdrawn 및 다운로드 불가이므로 갱신된 /r1/upd1/final을 읽는다."
            """;

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_infra_nist_reference_test");

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
    void replacesWithdrawnNistUrlWithoutChangingHistoryOrExistingPostgresReference() {
        CanonicalBootstrapExecutionResult first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "Initial bootstrap: " + first);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, first.totalItems());
        assertEquals(0, first.totals().errors());

        CanonicalContentFile file = contentSource.load().stream()
                .filter(entry -> entry.path().equals(PATH)).findFirst().orElseThrow();
        String corrected = new String(file.content(), StandardCharsets.UTF_8);
        assertTrue(corrected.contains(NEW_NIST), "Updated NIST block mismatch");
        assertFalse(corrected.contains(OLD_NIST));
        String historical = corrected.replace(NEW_NIST, OLD_NIST);
        assertFalse(historical.equals(corrected), "Historical source unchanged");
        assertEquals(corrected.substring(corrected.indexOf("\n---\n", 4)),
                historical.substring(historical.indexOf("\n---\n", 4)),
                "Reference-only modification must not change Concept body");

        long id = jdbc.queryForObject("select id from concept where content_key = ?", Long.class, KEY);
        ImportFilesCommand past = command(historical);
        var oldPreview = previewService.preview(past);
        assertTrue(oldPreview.canApply());
        assertEquals(0, oldPreview.errors());
        assertEquals(1, oldPreview.updated());
        assertEquals(1, applyService.apply(past, oldPreview.previewDigest()).updated());
        assertEquals(1, linkedCount(id, OLD_URL));

        jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 NIST historical note')", id);
        long qid = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, KEY + ".%");
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, qid);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", qid, attemptId);
        List<Map<String, Object>> notes = jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attempts = jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrong = jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand update = command(corrected);
        var preview = previewService.preview(update);
        assertTrue(preview.canApply(), () -> "Corrected preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(update, preview.previewDigest()).updated());
        assertEquals(id, jdbc.queryForObject("select id from concept where content_key = ?", Long.class, KEY));
        assertEquals(0, linkedCount(id, OLD_URL));
        assertEquals(1, linkedCount(id, NEW_URL));
        assertEquals(1, linkedCount(id, PG_URL));
        var refs = learningQueryService.getConcept(id).references();
        assertEquals(2, refs.size());
        assertTrue(refs.stream().anyMatch(ref -> ref.url().equals(NEW_URL)
                && ref.title().contains("Updated") && ref.relationNote().contains("Withdrawn")));
        assertTrue(refs.stream().anyMatch(ref -> ref.url().equals(PG_URL)));
        assertEquals(notes, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attempts, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrong, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full-pack exact reimport: " + repeated);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(notes, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attempts, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrong, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private int linkedCount(long id, String url) {
        return jdbc.queryForObject(
                "select count(*) from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?", Integer.class, id, url);
    }

    private static ImportFilesCommand command(String content) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(
                PATH, content.getBytes(StandardCharsets.UTF_8))));
    }
}
