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

/** A reference-note-only correction must preserve links and personal learning history. */
@Testcontainers
@SpringBootTest
class OsThreadReferenceScopeIntegrationTest {
    private static final String KEY = "operating-systems.core.threads.user-level-thread";
    private static final String PATH = "operating-systems/threads/user-level-thread.md";
    private static final String OSTEP = "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf";
    private static final String OLD_NOTE =
            "이 Concept에서는 사용자 공간 런타임이 논리 스레드를 하나 이상의 커널 스레드에 매핑할 때의 전환 비용과 블로킹 경계를 중심으로 읽는다.";
    private static final String NEW_NOTE =
            "26장 Concurrency: An Introduction의 프로세스 내 공유 주소 공간, 스레드별 PC·레지스터·스택, 생성·전환의 기초만 읽는다. "
            + "이 장은 사용자 수준 스레드의 M:N 매핑·런타임 스케줄링·블로킹 처리 모델을 직접 설명하지 않으므로 해당 내용을 이 자료의 근거로 사용하지 않는다.";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_os_ostep_reference_test");

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
    void limitsThreadIntroductionNoteWithoutRecreatingLinksOrErasingHistory() {
        CanonicalBootstrapExecutionResult first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "Initial bootstrap: " + first);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, first.totalItems());
        assertEquals(0, first.totals().errors());

        CanonicalContentFile input = contentSource.load().stream()
                .filter(entry -> entry.path().equals(PATH)).findFirst().orElseThrow();
        String corrected = new String(input.content(), StandardCharsets.UTF_8);
        assertTrue(corrected.contains(NEW_NOTE), "Corrected relation note must be packaged");
        assertFalse(corrected.contains(OLD_NOTE), "Old misleading note must be removed");
        String historical = corrected.replace(NEW_NOTE, OLD_NOTE);
        assertFalse(corrected.equals(historical));
        assertEquals(corrected.substring(corrected.indexOf("\n---\n", 4)),
                historical.substring(historical.indexOf("\n---\n", 4)),
                "Concept body must not change in a Reference-only correction");

        long id = jdbc.queryForObject("select id from concept where content_key = ?", Long.class, KEY);
        long referenceIdBefore = referenceId(id);
        ImportFilesCommand oldCommand = command(historical);
        var oldPreview = previewService.preview(oldCommand);
        assertTrue(oldPreview.canApply(), () -> "Old note preview: " + oldPreview);
        assertEquals(0, oldPreview.errors());
        assertEquals(1, oldPreview.updated());
        assertEquals(1, applyService.apply(oldCommand, oldPreview.previewDigest()).updated());
        assertTrue(learningQueryService.getConcept(id).references().stream()
                .anyMatch(ref -> ref.url().equals(OSTEP) && ref.relationNote().equals(OLD_NOTE)));

        jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 OS note history')", id);
        long qid = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, KEY + ".%");
        long quizId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, quizId, qid);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", qid, attemptId);
        List<Map<String, Object>> notesBefore = jdbc.queryForList("select * from personal_note order by id");
        List<Map<String, Object>> attemptsBefore = jdbc.queryForList("select * from attempt order by id");
        List<Map<String, Object>> wrongBefore = jdbc.queryForList("select * from wrong_note order by id");

        ImportFilesCommand newCommand = command(corrected);
        var preview = previewService.preview(newCommand);
        assertTrue(preview.canApply(), () -> "Corrected note preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(newCommand, preview.previewDigest()).updated());
        assertEquals(id, jdbc.queryForObject("select id from concept where content_key = ?", Long.class, KEY));
        assertEquals(referenceIdBefore, referenceId(id), "Same global Reference identity must remain stable");
        assertEquals(1, jdbc.queryForObject(
                "select count(*) from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?", Integer.class, id, OSTEP));
        assertTrue(learningQueryService.getConcept(id).references().stream()
                .anyMatch(ref -> ref.url().equals(OSTEP) && ref.relationNote().equals(NEW_NOTE)));
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full-pack exact reimport: " + repeated);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(referenceIdBefore, referenceId(id));
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private long referenceId(long conceptId) {
        return jdbc.queryForObject(
                "select r.id from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?", Long.class, conceptId, OSTEP);
    }

    private static ImportFilesCommand command(String markdown) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(
                PATH, markdown.getBytes(StandardCharsets.UTF_8))));
    }
}
