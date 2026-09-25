package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatch;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportPreviewResult;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 전체 canonical pack의 preview, apply, exact reimport와 학습 history 보존을 검증한다. */
@Testcontainers
@SpringBootTest
class CanonicalBootstrapIdempotencyIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_bootstrap_idempotency_test");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalContentSource contentSource;
    @Autowired CanonicalBootstrapBatchPlanner batchPlanner;
    @Autowired ContentImportPreviewService previewService;
    @Autowired ContentImportApplyService applyService;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @org.junit.jupiter.api.Test
    void canonicalCorrectionApplyAndExactReimportPreserveQuestionHistory() throws Exception {
        CanonicalBootstrapExecutionResult first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "initial canonical bootstrap failed: " + first);
        assertEquals(0, first.totals().errors());
        assertEquals(0, first.totals().failed());

        long questionId = jdbc.queryForObject(
                "select id from question where content_key = ?",
                Long.class,
                "network-http.core.http-methods.idempotent-method.q2");
        long attemptId = insertAttempt(questionId);
        long wrongNoteId = jdbc.queryForObject(
                "insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) "
                        + "values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, ?) returning id",
                Long.class, questionId, attemptId);
        jdbc.update(
                "insert into review_schedule (question_id, status, stage, due_at, last_reviewed_at, last_processed_attempt_id) "
                        + "values (?, 'SCHEDULED', 1, current_timestamp + interval '1 day', current_timestamp, ?)",
                questionId, attemptId);
        long reviewHistoryId = jdbc.queryForObject(
                "insert into review_history (question_id, quiz_session_id, attempt_id, result, stage_before, stage_after, reviewed_at, next_due_at) "
                        + "select question_id, quiz_session_id, id, 'WRONG', 1, 1, current_timestamp, current_timestamp + interval '1 day' "
                        + "from attempt where id = ? returning id",
                Long.class, attemptId);
        List<Map<String, Object>> questionIds = questionIds();
        int linkedConceptCount = jdbc.queryForObject(
                "select count(*) from question_concept where question_id = ?", Integer.class, questionId);
        String explanation = jdbc.queryForObject(
                "select explanation_markdown from question where id = ?", String.class, questionId);

        applyTemporaryQuestionRevision(questionId);
        assertHistoryPreserved(questionId, attemptId, wrongNoteId, reviewHistoryId);
        assertEquals(explanation, jdbc.queryForObject(
                "select explanation_markdown from question where id = ?", String.class, questionId));

        int previewErrorCount = 0;
        int previewItemCount = 0;
        for (CanonicalBootstrapBatch batch : batchPlanner.plan(contentSource.load()).batches()) {
            ImportPreviewResult preview = previewService.preview(batch.command());
            assertTrue(preview.canApply(), () -> "canonical preview cannot apply for batch " + batch.sequence());
            for (var item : preview.items()) {
                previewErrorCount += item.errors().size();
                previewItemCount++;
                assertEquals(ImportClassification.UNCHANGED, item.classification(),
                        () -> "canonical item changed on exact reimport: " + item.contentKey());
            }
        }
        assertEquals(0, previewErrorCount);
        assertEquals(first.totalItems(), previewItemCount);

        CanonicalBootstrapExecutionResult second = bootstrapService.bootstrap();
        assertTrue(second.success(), () -> "exact canonical reimport failed: " + second);
        assertEquals(first.totalItems(), second.totals().unchanged());
        assertEquals(0, second.totals().errors());
        assertEquals(0, second.totals().failed());

        assertEquals(questionIds, questionIds());
        assertEquals(questionId, jdbc.queryForObject(
                "select id from question where content_key = ?", Long.class,
                "network-http.core.http-methods.idempotent-method.q2"));
        assertEquals(attemptId, jdbc.queryForObject("select id from attempt where question_id = ?", Long.class, questionId));
        assertEquals(wrongNoteId, jdbc.queryForObject("select id from wrong_note where question_id = ?", Long.class, questionId));
        assertEquals(questionId, jdbc.queryForObject("select question_id from review_schedule where question_id = ?", Long.class, questionId));
        assertEquals(reviewHistoryId, jdbc.queryForObject("select id from review_history where question_id = ?", Long.class, questionId));
        assertEquals(linkedConceptCount, jdbc.queryForObject(
                "select count(*) from question_concept where question_id = ?", Integer.class, questionId));
        assertEquals(explanation, jdbc.queryForObject(
                "select explanation_markdown from question where id = ?", String.class, questionId));
    }

    private void applyTemporaryQuestionRevision(long questionId) throws Exception {
        CanonicalContentFile questionPack = contentSource.load().stream()
                .filter(file -> file.path().equals("network-http/http-methods/questions.json"))
                .findFirst()
                .orElseThrow();
        ImportFilesCommand revisedCommand = revisedQuestionCommand(questionPack);
        var preview = previewService.preview(revisedCommand);
        assertTrue(preview.canApply());
        assertEquals(0, preview.errors());
        assertEquals(1, preview.updated());
        assertEquals(1, applyService.apply(revisedCommand, preview.previewDigest()).updated());
        assertEquals(questionId, jdbc.queryForObject(
                "select id from question where content_key = ?", Long.class,
                "network-http.core.http-methods.idempotent-method.q2"));

        ImportFilesCommand canonicalCommand = new ImportFilesCommand(List.of(new ImportSourceFile(
                questionPack.path(), questionPack.content())));
        var canonicalPreview = previewService.preview(canonicalCommand);
        assertTrue(canonicalPreview.canApply());
        assertEquals(0, canonicalPreview.errors());
        assertEquals(1, canonicalPreview.updated());
        assertEquals(1, applyService.apply(canonicalCommand, canonicalPreview.previewDigest()).updated());
    }

    private static ImportFilesCommand revisedQuestionCommand(CanonicalContentFile questionPack) {
        String json = new String(questionPack.content(), StandardCharsets.UTF_8);
        String contentKey = "\"contentKey\":\"network-http.core.http-methods.idempotent-method.q2\"";
        int questionStart = json.indexOf(contentKey);
        if (questionStart < 0) throw new IllegalArgumentException("Question not found: " + contentKey);

        int fieldStart = json.indexOf("\"explanationMarkdown\"", questionStart);
        int valueStart = json.indexOf(':', fieldStart) + 1;
        while (Character.isWhitespace(json.charAt(valueStart))) valueStart++;
        if (fieldStart < 0 || json.charAt(valueStart) != '"') {
            throw new IllegalArgumentException("Question explanation is not a JSON string");
        }

        int valueEnd = jsonStringEnd(json, valueStart);
        String revisedJson = json.substring(0, valueEnd) + " 임시 import 갱신 검증." + json.substring(valueEnd);
        return new ImportFilesCommand(List.of(new ImportSourceFile(
                questionPack.path(), revisedJson.getBytes(StandardCharsets.UTF_8))));
    }

    private static int jsonStringEnd(String json, int openingQuote) {
        for (int index = openingQuote + 1; index < json.length(); index++) {
            if (json.charAt(index) == '\\') {
                index++;
            } else if (json.charAt(index) == '"') {
                return index;
            }
        }
        throw new IllegalArgumentException("Unterminated JSON string");
    }

    private void assertHistoryPreserved(long questionId, long attemptId, long wrongNoteId, long reviewHistoryId) {
        assertEquals(attemptId, jdbc.queryForObject("select id from attempt where question_id = ?", Long.class, questionId));
        assertEquals(wrongNoteId, jdbc.queryForObject("select id from wrong_note where question_id = ?", Long.class, questionId));
        assertEquals(questionId, jdbc.queryForObject(
                "select question_id from review_schedule where question_id = ?", Long.class, questionId));
        assertEquals(reviewHistoryId, jdbc.queryForObject(
                "select id from review_history where question_id = ?", Long.class, questionId));
    }

    private long insertAttempt(long questionId) {
        long sessionId = jdbc.queryForObject(
                "insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id",
                Long.class);
        return jdbc.queryForObject(
                "insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) "
                        + "values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id",
                Long.class, sessionId, questionId);
    }

    private List<Map<String, Object>> questionIds() {
        return jdbc.queryForList("select content_key, id from question order by content_key");
    }
}
