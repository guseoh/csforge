package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

/** Verifies full Question synchronization against mixed canonical, database-only, and personal-history changes. */
@SpringBootTest
@Testcontainers
class QuestionContentSyncIntegrationTest {
    @Container static final PostgreSQLContainer<?> DB = PostgresIntegrationTestSupport.container("question_content_sync");
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, DB);
    }

    @Autowired QuestionContentSyncService sync;
    @Autowired ClasspathCanonicalContentSource packaged;
    @Autowired ContentImportPreviewService preview;
    @Autowired ContentImportApplyService apply;
    @Autowired AtomicReference<List<CanonicalContentFile>> input;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper json;

    @TestConfiguration static class Source {
        @Bean AtomicReference<List<CanonicalContentFile>> questionSyncInput() { return new AtomicReference<>(List.of()); }
        @Bean @Primary CanonicalContentSource testSource(AtomicReference<List<CanonicalContentFile>> files) { return files::get; }
    }

    @Test void reconcilesOnlyCanonicalChangesAndPreservesDriftAndQuestionHistory() throws Exception {
        var files = packaged.load();
        seed(file(files, "java/topics.json"));
        seed(file(files, "java/language-types/primitive-reference-values.md"));
        var original = json.readTree(file(files, "java/language-types/questions.json").content());
        var q1 = (ObjectNode) original.get(0).deepCopy();
        var q2 = (ObjectNode) original.get(1).deepCopy();
        var q3 = (ObjectNode) original.get(2).deepCopy();
        var baseline = questionFile(q1, q2, q3);
        seed(baseline);

        String key1 = q1.get("contentKey").asText();
        String key2 = q2.get("contentKey").asText();
        String key3 = q3.get("contentKey").asText();
        long id3 = jdbc.queryForObject("select id from question where content_key = ?", Long.class, key3);
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session(started_at, source) values(current_timestamp, 'STANDARD') returning id", Long.class);
        jdbc.update("insert into attempt(quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                + "values(?, ?, 'GRADED', false, current_timestamp, current_timestamp)", sessionId, id3);
        var attemptsBefore = jdbc.queryForList("select * from attempt order by id");

        q1.put("explanationMarkdown", q1.get("explanationMarkdown").asText() + " 안전한 텍스트 반영");
        ((ObjectNode) q2.get("choices").get(1)).put("content", "변경된 보기 내용");
        q3.put("explanationMarkdown", q3.get("explanationMarkdown").asText() + " 과거 풀이 보존");
        input.set(List.of(questionFile(q1, q2, q3)));
        String shaA = "a".repeat(40);
        var initialized = sync.synchronize(shaA, "", ContentSyncAuditDigest.calculate(input.get()), true);
        assertEquals(2, initialized.updated());
        assertEquals(0, initialized.created());
        assertEquals(1, initialized.deferred());
        assertEquals(q1.get("explanationMarkdown").asText(), questionValue(key1, "explanation_markdown"));
        assertEquals("변경된 보기 내용", jdbc.queryForObject("select content_markdown from question_choice "
                + "where question_id = (select id from question where content_key = ?) and choice_key = 'B'", String.class, key2));
        assertNotEquals(q3.get("explanationMarkdown").asText(), questionValue(key3, "explanation_markdown"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));

        q1.put("promptMarkdown", q1.get("promptMarkdown").asText() + " 다음 canonical 변경");
        q2.put("explanationMarkdown", q2.get("explanationMarkdown").asText() + " 충돌 확인");
        q3.put("explanationMarkdown", q3.get("explanationMarkdown").asText() + " 추가 변경");
        jdbc.update("update question set prompt_markdown = prompt_markdown || ' DB 단독 변경' where content_key = ?", key2);
        input.set(List.of(questionFile(q1, q2, q3)));
        String shaB = "b".repeat(40);
        var applied = sync.synchronize(shaB, shaA, ContentSyncAuditDigest.calculate(input.get()), false);
        assertEquals(1, applied.updated());
        assertEquals(2, applied.deferred());
        assertTrue(questionValue(key1, "prompt_markdown").endsWith("다음 canonical 변경"));
        assertTrue(questionValue(key2, "prompt_markdown").endsWith("DB 단독 변경"));
        assertNotEquals(q2.get("explanationMarkdown").asText(), questionValue(key2, "explanation_markdown"));
        assertNotEquals(q3.get("explanationMarkdown").asText(), questionValue(key3, "explanation_markdown"));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
        var rerun = sync.synchronize(shaB, shaB, ContentSyncAuditDigest.calculate(input.get()), false);
        assertEquals(0, rerun.updated());
        assertEquals(0, rerun.created());
        assertEquals(2, rerun.deferred());

        input.set(List.of(questionFile(q1, q3)));
        assertThrows(IllegalStateException.class, () -> sync.synchronize("c".repeat(40), shaB,
                ContentSyncAuditDigest.calculate(input.get()), false));
        assertEquals(shaB, jdbc.queryForObject("select source_sha from content_sync_checkpoint where scope = 'ALL_QUESTIONS'", String.class));
        assertEquals(attemptsBefore, jdbc.queryForList("select * from attempt order by id"));
    }

    private String questionValue(String key, String column) {
        return jdbc.queryForObject("select " + column + " from question where content_key = ?", String.class, key);
    }

    private CanonicalContentFile questionFile(ObjectNode... values) {
        return new CanonicalContentFile("java/language-types/questions.json", json.writeValueAsBytes(List.of(values)));
    }

    private CanonicalContentFile file(List<CanonicalContentFile> files, String path) {
        return files.stream().filter(candidate -> candidate.path().equals(path)).findFirst().orElseThrow();
    }

    private void seed(CanonicalContentFile file) {
        seed(List.of(file));
    }

    private void seed(List<CanonicalContentFile> files) {
        var command = new ImportFilesCommand(files.stream()
                .map(file -> new ImportSourceFile(file.path(), file.content())).toList());
        var result = preview.preview(command);
        assertTrue(result.canApply(), result.toString());
        apply.apply(command, result.previewDigest());
    }
}
