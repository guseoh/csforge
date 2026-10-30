package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
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

/** Java Reference link removal preserves learning history and full canonical reimport idempotency. */
@Testcontainers
@SpringBootTest
class JavaReferenceCorrectionIntegrationTest {
    private static final String CONCEPT_KEY = "java.core.api-design.static-factory-method";
    private static final String REMOVED_URL =
            "https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_java_reference_correction_test");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalContentSource contentSource;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void removingOutdatedReferenceKeepsConceptAndLearningHistory() throws Exception {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical import: " + initial);
        assertEquals(0, initial.totals().errors());
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());

        long conceptId = jdbc.queryForObject(
                "select id from concept where content_key = ?", Long.class, CONCEPT_KEY);
        long questionId = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, CONCEPT_KEY + ".%");
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attemptId = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId);
        long wrongNoteId = jdbc.queryForObject(
                "insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                        + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?) returning id",
                Long.class, questionId, attemptId);
        long noteId = jdbc.queryForObject(
                "insert into personal_note (concept_id, content) values (?, 'Reference study note') returning id",
                Long.class, conceptId);

        CanonicalContentFile canonical = contentSource.load().stream()
                .filter(file -> file.path().equals("java/api-design/static-factory-method.md"))
                .findFirst().orElseThrow();
        String corrected = new String(canonical.content(), StandardCharsets.UTF_8).replace("\r\n", "\n");
        int closing = corrected.indexOf("\n---\n", 4);
        assertTrue(closing > 0, "Expected closing YAML frontmatter delimiter");
        String oldRelation = """
                
                  - url: "https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/"
                    title: "정적 팩토리 메서드(Static Factory Method)는 왜 사용할까?"
                    referenceType: KOREAN_BLOG
                    language: ko
                    displayOrder: 2
                    relationNote: 이름 있는 생성과 하위 타입 반환 등 정적 팩터리의 사용 이유를 한국어 예제로 복습
                """;
        String previous = corrected.substring(0, closing) + oldRelation + corrected.substring(closing);

        var previousPreview = previewService.preview(command(canonical.path(), previous));
        assertTrue(previousPreview.canApply());
        assertEquals(1, previousPreview.updated());
        assertEquals(1, applyService.apply(
                command(canonical.path(), previous), previousPreview.previewDigest()).updated());
        assertEquals(1, linkedUrlCount(conceptId, REMOVED_URL));

        var correctedPreview = previewService.preview(command(canonical.path(), corrected));
        assertTrue(correctedPreview.canApply());
        assertEquals(0, correctedPreview.errors());
        assertEquals(1, correctedPreview.updated());
        assertEquals(1, applyService.apply(
                command(canonical.path(), corrected), correctedPreview.previewDigest()).updated());
        assertEquals(0, linkedUrlCount(conceptId, REMOVED_URL));
        assertEquals(conceptId, jdbc.queryForObject(
                "select id from concept where content_key = ?", Long.class, CONCEPT_KEY));
        assertEquals(questionId, jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, CONCEPT_KEY + ".%"));
        assertEquals(attemptId, jdbc.queryForObject(
                "select id from attempt where question_id = ?", Long.class, questionId));
        assertEquals(wrongNoteId, jdbc.queryForObject(
                "select id from wrong_note where question_id = ?", Long.class, questionId));
        assertEquals(noteId, jdbc.queryForObject(
                "select id from personal_note where concept_id = ?", Long.class, conceptId));

        CanonicalBootstrapExecutionResult repeated = bootstrapService.bootstrap();
        assertTrue(repeated.success(), () -> "Full-pack exact reimport: " + repeated);
        assertEquals(initial.totalItems(), repeated.totals().unchanged());
        assertEquals(0, repeated.totals().errors());
        assertEquals(0, repeated.totals().failed());
        assertEquals(0, linkedUrlCount(conceptId, REMOVED_URL));
    }

    private int linkedUrlCount(long conceptId, String url) {
        return jdbc.queryForObject(
                "select count(*) from concept_reference cr "
                        + "join reference r on r.id = cr.reference_id "
                        + "where cr.concept_id = ? and r.url = ?",
                Integer.class, conceptId, url);
    }

    private static ImportFilesCommand command(String path, String source) {
        return new ImportFilesCommand(List.of(
                new ImportSourceFile(path, source.getBytes(StandardCharsets.UTF_8))));
    }
}
