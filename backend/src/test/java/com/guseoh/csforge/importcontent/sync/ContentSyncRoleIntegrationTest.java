package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 동기화 역할에 필요한 권한과 개인 기록 보호를 격리 DB에서 검증한다. */
@SpringBootTest
@Testcontainers
class ContentSyncRoleIntegrationTest {
    @Container static final PostgreSQLContainer<?> DB = PostgresIntegrationTestSupport.container("sync_role");
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, DB);
    }
    @Autowired JdbcTemplate jdbc;
    @Autowired AtomicReference<List<CanonicalContentFile>> sourceFiles;
    @Autowired ClasspathCanonicalContentSource packaged;
    @Autowired ContentSyncService contentSync;
    @Autowired QuestionContentSyncService questionSync;
    @Autowired ContentImportPreviewService preview;
    @Autowired ContentImportApplyService apply;
    @Autowired PlatformTransactionManager transactions;
    @Autowired tools.jackson.databind.ObjectMapper json;

    @TestConfiguration
    static class CanonicalSourceOverride {
        @Bean AtomicReference<List<CanonicalContentFile>> contentSyncInput() { return new AtomicReference<>(List.of()); }
        @Bean @Primary CanonicalContentSource isolatedSource(AtomicReference<List<CanonicalContentFile>> input) { return input::get; }
    }

    @Test void scopedRoleCannotReadOrWritePersonalData() throws Exception {
        String sql = Files.readString(Path.of("..", "infra", "content-sync", "sync-role-grants.sql"));
        sql = sql.replace("DATABASE neondb", "DATABASE " + DB.getDatabaseName());
        jdbc.execute("CREATE ROLE csforge_content_sync NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT");
        jdbc.execute(sql);
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_column_privilege('csforge_content_sync','public.attempt','question_id','SELECT')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.attempt','UPDATE')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.concept_progress','SELECT')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.question','DELETE')", Boolean.class));
        assertEquals(Boolean.FALSE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.attempt','INSERT')", Boolean.class));
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.concept','UPDATE')", Boolean.class));
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_sequence_privilege('csforge_content_sync','public.concept_id_seq','USAGE')", Boolean.class));
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.question_choice','DELETE')", Boolean.class));
        assertEquals(Boolean.TRUE, jdbc.queryForObject("SELECT has_table_privilege('csforge_content_sync','public.question_concept','INSERT')", Boolean.class));

        verifyCanonicalSyncWorksUnderRestrictedRole();
    }

    private void verifyCanonicalSyncWorksUnderRestrictedRole() throws Exception {
        var files = packaged.load();
        var topic = files.stream().filter(file -> file.path().equals("java/topics.json")).findFirst().orElseThrow();
        var concept = files.stream().filter(file -> file.path().equals("java/language-types/primitive-reference-values.md"))
                .findFirst().orElseThrow();
        var questionFile = files.stream().filter(file -> file.path().equals("java/language-types/questions.json"))
                .findFirst().orElseThrow();
        var question = (tools.jackson.databind.node.ObjectNode) json.readTree(questionFile.content()).get(0).deepCopy();
        String key = question.get("contentKey").asText();
        var selectedQuestionFile = new CanonicalContentFile(questionFile.path(), json.writeValueAsBytes(List.of(question)));

        seed(topic);
        sourceFiles.set(List.of(topic));
        restricted(() -> contentSync.synchronize(ContentSyncScope.ALL_TOPICS, "a".repeat(40), "",
                ContentSyncAuditDigest.calculate(sourceFiles.get()), true));
        var topics = (tools.jackson.databind.node.ArrayNode) json.readTree(topic.content());
        for (var item : topics) {
            if (item.path("contentKey").asText().equals("java.core.language-types")) {
                ((tools.jackson.databind.node.ObjectNode) item).put("title", item.path("title").asText() + " 제한 역할 검증");
            }
        }
        sourceFiles.set(List.of(new CanonicalContentFile(topic.path(), json.writeValueAsBytes(topics))));
        var topicUpdate = restricted(() -> contentSync.synchronize(ContentSyncScope.ALL_TOPICS, "b".repeat(40), "a".repeat(40),
                ContentSyncAuditDigest.calculate(sourceFiles.get()), false));
        assertEquals(1, topicUpdate.updated());

        seed(concept);
        sourceFiles.set(List.of(concept));
        restricted(() -> contentSync.synchronize(ContentSyncScope.ALL_CONCEPTS, "a".repeat(40), "",
                ContentSyncAuditDigest.calculate(sourceFiles.get()), true));
        byte[] suffix = "\n\n제한 역할 검증\n".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] changedContent = java.util.Arrays.copyOf(concept.content(), concept.content().length + suffix.length);
        System.arraycopy(suffix, 0, changedContent, concept.content().length, suffix.length);
        var changedConcept = new CanonicalContentFile(concept.path(), changedContent);
        sourceFiles.set(List.of(changedConcept));
        var conceptUpdate = restricted(() -> contentSync.synchronize(ContentSyncScope.ALL_CONCEPTS, "b".repeat(40), "a".repeat(40),
                ContentSyncAuditDigest.calculate(sourceFiles.get()), false));
        assertEquals(1, conceptUpdate.updated());

        sourceFiles.set(List.of(selectedQuestionFile));
        var initialized = restricted(() -> questionSync.synchronize("a".repeat(40), "",
                ContentSyncAuditDigest.calculate(sourceFiles.get()), true));
        assertEquals(1, initialized.created());
        assertEquals(0, initialized.deferred());

        question.put("promptMarkdown", question.get("promptMarkdown").asText() + " 변경");
        selectedQuestionFile = new CanonicalContentFile(questionFile.path(), json.writeValueAsBytes(List.of(question)));
        sourceFiles.set(List.of(selectedQuestionFile));
        var updated = restricted(() -> questionSync.synchronize("b".repeat(40), "a".repeat(40),
                ContentSyncAuditDigest.calculate(sourceFiles.get()), false));
        assertEquals(1, updated.updated());
        assertEquals(question.get("promptMarkdown").asText(), jdbc.queryForObject(
                "select prompt_markdown from question where content_key = ?", String.class, key));

        long questionId = jdbc.queryForObject("select id from question where content_key = ?", Long.class, key);
        long sessionId = jdbc.queryForObject("insert into quiz_session(started_at, source) values(current_timestamp, 'STANDARD') returning id", Long.class);
        jdbc.update("insert into attempt(quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                + "values(?, ?, 'GRADED', false, current_timestamp, current_timestamp)", sessionId, questionId);
        var attempts = jdbc.queryForList("select * from attempt order by id");
        question.put("explanationMarkdown", question.get("explanationMarkdown").asText() + " 이력 보호");
        sourceFiles.set(List.of(new CanonicalContentFile(questionFile.path(), json.writeValueAsBytes(List.of(question)))));
        var preserved = restricted(() -> questionSync.synchronize("c".repeat(40), "b".repeat(40),
                ContentSyncAuditDigest.calculate(sourceFiles.get()), false));
        assertEquals(0, preserved.updated());
        assertEquals(1, preserved.deferred());
        assertEquals(attempts, jdbc.queryForList("select * from attempt order by id"));
        assertNotEquals(question.get("explanationMarkdown").asText(), jdbc.queryForObject(
                "select explanation_markdown from question where content_key = ?", String.class, key));
    }

    private void seed(CanonicalContentFile file) {
        var command = new ImportFilesCommand(List.of(new ImportSourceFile(file.path(), file.content())));
        var result = preview.preview(command);
        assertTrue(result.canApply(), result.toString());
        apply.apply(command, result.previewDigest());
    }

    private <T> T restricted(java.util.concurrent.Callable<T> action) throws Exception {
        return new TransactionTemplate(transactions).execute(status -> {
            jdbc.execute("SET LOCAL ROLE csforge_content_sync");
            try {
                return action.call();
            } catch (Exception exception) {
                throw new IllegalStateException(exception);
            }
        });
    }
}
