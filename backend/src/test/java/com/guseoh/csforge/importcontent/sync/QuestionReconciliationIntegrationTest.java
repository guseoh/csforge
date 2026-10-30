package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import java.util.List;
import java.util.Set;
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
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

/** 혼합 파일에서 명시된 안전 문항만 반영하고 개인 이력과 다른 문항을 보존한다. */
@SpringBootTest
@Testcontainers
class QuestionReconciliationIntegrationTest {
    @Container static final PostgreSQLContainer<?> DB = PostgresIntegrationTestSupport.container("question_reconcile");
    @DynamicPropertySource static void database(DynamicPropertyRegistry r) { PostgresIntegrationTestSupport.registerDataSourceProperties(r, DB); }
    @Autowired QuestionReconciliationService reconcile;
    @Autowired ClasspathCanonicalContentSource packaged;
    @Autowired ContentImportPreviewService preview;
    @MockitoSpyBean ContentImportApplyService apply;
    @Autowired AtomicReference<List<CanonicalContentFile>> input;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper json;

    @TestConfiguration static class Source {
        @Bean AtomicReference<List<CanonicalContentFile>> reconcileInput() { return new AtomicReference<>(List.of()); }
        @Bean @Primary CanonicalContentSource testSource(AtomicReference<List<CanonicalContentFile>> value) { return value::get; }
    }

    @Test void selectedTextUpdatesAreAtomicAndNeverIncludeAttemptedOrStructuralNeighbors() {
        var files = packaged.load();
        seed(List.of(file(files, "java/topics.json")));
        seed(List.of(file(files, "java/language-types/primitive-reference-values.md")));
        var root = json.readTree(file(files, "java/language-types/questions.json").content());
        var a = (ObjectNode) root.get(0).deepCopy();
        var b = (ObjectNode) root.get(1).deepCopy();
        var c = (ObjectNode) root.get(2).deepCopy();
        seed(List.of(questionFile(a, b, c)));
        String keyA = a.get("contentKey").asText();
        String keyB = b.get("contentKey").asText();
        String keyC = c.get("contentKey").asText();
        long idC = jdbc.queryForObject("select id from question where content_key = ?", Long.class, keyC);
        long session = jdbc.queryForObject("insert into quiz_session(started_at, source) values(current_timestamp, 'STANDARD') returning id", Long.class);
        jdbc.update("insert into attempt(quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) values(?, ?, 'GRADED', false, current_timestamp, current_timestamp)", session, idC);
        var history = jdbc.queryForList("select * from attempt order by id");
        var before = jdbc.queryForList("select id, content_key, prompt_markdown, explanation_markdown from question order by id");
        a.put("explanationMarkdown", a.get("explanationMarkdown").asText() + " 추가 해설");
        ((ObjectNode) b.get("choices").get(0)).put("rationaleMarkdown", "변경된 오답 설명");
        c.put("explanationMarkdown", c.get("explanationMarkdown").asText() + " 이력 있는 문항");
        input.set(List.of(questionFile(a, b, c)));
        assertThrows(IllegalStateException.class, () -> reconcile.preview(Set.of(keyB)));
        assertThrows(IllegalStateException.class, () -> reconcile.preview(Set.of(keyC)));
        var p = reconcile.preview(Set.of(keyA));
        assertEquals(1, p.updated());
        assertThrows(IllegalStateException.class, () -> reconcile.apply(Set.of(keyA), "stale", p.previewDigest()));
        doAnswer(invocation -> { invocation.callRealMethod(); throw new IllegalStateException("simulated failure"); })
                .when(apply).apply(any(), anyString());
        assertThrows(IllegalStateException.class, () -> reconcile.apply(Set.of(keyA), p.sourceDigest(), p.previewDigest()));
        assertEquals(before, jdbc.queryForList("select id, content_key, prompt_markdown, explanation_markdown from question order by id"));
        reset(apply);
        assertEquals(1, reconcile.apply(Set.of(keyA), p.sourceDigest(), p.previewDigest()).updated());
        assertEquals(history, jdbc.queryForList("select * from attempt order by id"));
        var after = jdbc.queryForList("select id, content_key, prompt_markdown, explanation_markdown from question order by id");
        assertEquals(before.get(1), after.get(1));
        assertEquals(before.get(2), after.get(2));
        assertEquals(0, jdbc.queryForObject("select count(*) from content_sync_checkpoint where scope = 'JAVA_QUESTIONS'", Integer.class));
        var current = reconcile.preview(Set.of(keyA));
        assertEquals(1, current.unchanged());
        a.put("explanationMarkdown", a.get("explanationMarkdown").asText() + " 이후 수정");
        input.set(List.of(questionFile(a, b, c)));
        var stale = reconcile.preview(Set.of(keyA));
        long idA = jdbc.queryForObject("select id from question where content_key = ?", Long.class, keyA);
        jdbc.update("insert into attempt(quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) values(?, ?, 'GRADED', false, current_timestamp, current_timestamp)", session, idA);
        var withNewAttempt = jdbc.queryForList("select * from attempt order by id");
        assertThrows(IllegalStateException.class, () -> reconcile.apply(Set.of(keyA), stale.sourceDigest(), stale.previewDigest()));
        assertEquals(after, jdbc.queryForList("select id, content_key, prompt_markdown, explanation_markdown from question order by id"));
        assertEquals(withNewAttempt, jdbc.queryForList("select * from attempt order by id"));
    }

    private CanonicalContentFile questionFile(ObjectNode... values) {
        return new CanonicalContentFile("java/language-types/questions.json", json.writeValueAsBytes(List.of(values)));
    }

    private CanonicalContentFile file(List<CanonicalContentFile> files, String path) {
        return files.stream().filter(f -> f.path().equals(path)).findFirst().orElseThrow();
    }

    private void seed(List<CanonicalContentFile> files) {
        var command = new ImportFilesCommand(files.stream().map(f -> new ImportSourceFile(f.path(), f.content())).toList());
        var result = preview.preview(command);
        assertTrue(result.canApply());
        apply.apply(command, result.previewDigest());
    }
}
