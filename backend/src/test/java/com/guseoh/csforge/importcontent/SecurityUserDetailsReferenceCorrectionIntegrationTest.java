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

/** Updating the UserDetailsService reference must retain learning history and stable Concept identity. */
@Testcontainers
@SpringBootTest
class SecurityUserDetailsReferenceCorrectionIntegrationTest {
    private static final String KEY = "security.core.auth-architecture.user-details";
    private static final String PATH = "security/auth-architecture/user-details.md";
    private static final String OLD_URL =
            "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details.html";
    private static final String NEW_URL =
            "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details-service.html";
    private static final String PASSWORD_STORAGE =
            "https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html";
    private static final String OLD_NOTE =
            "DaoAuthenticationProvider와 UserDetailsService의 협력 확인";
    private static final String NEW_NOTE =
            "UserDetailsService의 사용자 계정 조회 책임을 확인한다. 실제 패스워드 검증은 DaoAuthenticationProvider와 PasswordEncoder에 속한다.";

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_r2_security_userdetails_reference");

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
    void replacesUserDetailsUrlWithoutChangingQuestionOrPersonalHistory() {
        CanonicalBootstrapExecutionResult initial = bootstrapService.bootstrap();
        assertTrue(initial.success(), () -> "Initial canonical bootstrap: " + initial);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, initial.totalItems());
        assertEquals(0, initial.totals().errors());

        CanonicalContentFile source = contentSource.load().stream()
                .filter(item -> item.path().equals(PATH)).findFirst().orElseThrow();
        String corrected = new String(source.content(), StandardCharsets.UTF_8);
        assertTrue(corrected.contains(NEW_URL));
        assertTrue(corrected.contains(NEW_NOTE));
        String historical = corrected.replace(NEW_URL, OLD_URL).replace(NEW_NOTE, OLD_NOTE);
        assertFalse(corrected.equals(historical));
        assertEquals(corrected.substring(corrected.indexOf("\n---\n", 4)),
                historical.substring(historical.indexOf("\n---\n", 4)),
                "Reference correction must preserve the Concept body");

        long conceptId = jdbc.queryForObject("select id from concept where content_key = ?", Long.class, KEY);
        var oldCommand = command(historical);
        var oldPreview = previewService.preview(oldCommand);
        assertTrue(oldPreview.canApply(), () -> "Historical preview: " + oldPreview);
        assertEquals(0, oldPreview.errors());
        assertEquals(1, oldPreview.updated());
        assertEquals(1, applyService.apply(oldCommand, oldPreview.previewDigest()).updated());
        assertEquals(1, linkedCount(conceptId, OLD_URL));

        jdbc.update("insert into personal_note (concept_id, content) values (?, 'R2 Security note')", conceptId);
        long questionId = jdbc.queryForObject(
                "select id from question where content_key like ? order by content_key limit 1",
                Long.class, KEY + ".%");
        long session = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        long attempt = jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, session, questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?)", questionId, attempt);
        var notesBefore = jdbc.queryForList("select * from personal_note order by id");
        var attemptsBefore = jdbc.queryForList("select * from attempt order by id");
        var wrongBefore = jdbc.queryForList("select * from wrong_note order by id");

        var command = command(corrected);
        var preview = previewService.preview(command);
        assertTrue(preview.canApply(), () -> "Corrected preview: " + preview);
        assertEquals(0, preview.errors());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(command, preview.previewDigest()).updated());
        assertEquals(conceptId, jdbc.queryForObject("select id from concept where content_key = ?", Long.class, KEY));
        assertEquals(0, linkedCount(conceptId, OLD_URL));
        assertEquals(1, linkedCount(conceptId, NEW_URL));
        assertEquals(1, linkedCount(conceptId, PASSWORD_STORAGE));
        var refs = learningQueryService.getConcept(conceptId).references();
        assertEquals(2, refs.size());
        assertTrue(refs.stream().anyMatch(ref -> ref.url().equals(NEW_URL)
                && ref.title().contains("UserDetailsService")
                && ref.relationNote().contains("PasswordEncoder")));
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));

        CanonicalBootstrapExecutionResult reimport = bootstrapService.bootstrap();
        assertTrue(reimport.success(), () -> "Full canonical exact reimport: " + reimport);
        assertEquals(CanonicalInventory.TOTAL_ITEMS, reimport.totals().unchanged());
        assertEquals(0, reimport.totals().errors());
        assertEquals(0, reimport.totals().failed());
        assertEquals(notesBefore, jdbc.queryForList("select * from personal_note order by id"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        assertEquals(wrongBefore, jdbc.queryForList("select * from wrong_note order by id"));
    }

    private int linkedCount(long conceptId, String url) {
        return jdbc.queryForObject(
                "select count(*) from concept_reference cr join reference r on r.id=cr.reference_id "
                        + "where cr.concept_id=? and r.url=?", Integer.class, conceptId, url);
    }

    private static ImportFilesCommand command(String markdown) {
        return new ImportFilesCommand(List.of(new ImportSourceFile(
                PATH, markdown.getBytes(StandardCharsets.UTF_8))));
    }
}
