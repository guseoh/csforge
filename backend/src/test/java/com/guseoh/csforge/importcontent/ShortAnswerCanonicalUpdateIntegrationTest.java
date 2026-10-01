package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;

import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportPreviewResult;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 단답형 canonical 구조 갱신과 객관식 전환을 PostgreSQL에서 검증한다. */
@Testcontainers
@SpringBootTest
class ShortAnswerCanonicalUpdateIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_short_answer_import_test");

    @Autowired
    ContentImportPreviewService previewService;

    @Autowired
    ContentImportApplyService applyService;

    @Autowired
    JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @BeforeEach
    void cleanCanonicalContent() {
        jdbc.update("delete from review_history");
        jdbc.update("delete from review_schedule");
        jdbc.update("delete from wrong_note");
        jdbc.update("delete from attempt");
        jdbc.update("delete from quiz_question");
        jdbc.update("delete from quiz_session");
        jdbc.update("delete from question_concept");
        jdbc.update("delete from question_answer");
        jdbc.update("delete from question_choice");
        jdbc.update("delete from question");
        jdbc.update("delete from concept_reference");
        jdbc.update("delete from personal_note");
        jdbc.update("delete from concept_progress");
        jdbc.update("delete from concept");
        jdbc.update("delete from reference");
        jdbc.update("delete from topic");
    }

    @Test
    void structuralUpdateReusesExistingAcceptedAnswerRows() {
        ImportFilesCommand initial = shortAnswerCommand(List.of("test.concept.a"));
        ImportPreviewResult initialPreview = previewService.preview(initial);
        assertTrue(initialPreview.canApply());
        applyService.apply(initial, initialPreview.previewDigest());

        long questionId = jdbc.queryForObject(
                "select id from question where content_key = 'test.short-answer'", Long.class);
        long firstAnswerId = acceptedAnswerId(questionId, "10000000");
        long secondAnswerId = acceptedAnswerId(questionId, "-128");

        ImportFilesCommand changed = shortAnswerCommand(List.of("test.concept.a", "test.concept.b"));
        ImportPreviewResult changedPreview = previewService.preview(changed);
        assertTrue(changedPreview.canApply());
        assertEquals(1, changedPreview.updated());

        applyService.apply(changed, changedPreview.previewDigest());

        assertEquals(firstAnswerId, acceptedAnswerId(questionId, "10000000"));
        assertEquals(secondAnswerId, acceptedAnswerId(questionId, "-128"));
        assertEquals(2, jdbc.queryForObject(
                "select count(*) from question_answer where question_id = ? and answer_kind = 'ACCEPTED_TEXT'",
                Integer.class,
                questionId));
        assertEquals(2, jdbc.queryForObject(
                "select count(*) from question_concept where question_id = ?",
                Integer.class,
                questionId));

        ImportPreviewResult identicalPreview = previewService.preview(changed);
        assertTrue(identicalPreview.canApply());
        assertEquals(0, identicalPreview.updated());
        assertEquals(4, identicalPreview.unchanged());
    }

    @Test
    void shortAnswerCanTransitionToMultipleChoiceWithPersistedCorrectChoice() {
        ImportFilesCommand initial = shortAnswerCommand(List.of("test.concept.a"));
        ImportPreviewResult initialPreview = previewService.preview(initial);
        assertTrue(initialPreview.canApply());
        applyService.apply(initial, initialPreview.previewDigest());

        long questionId = jdbc.queryForObject(
                "select id from question where content_key = 'test.short-answer'", Long.class);

        ImportFilesCommand changed = multipleChoiceCommand();
        ImportPreviewResult changedPreview = previewService.preview(changed);
        assertTrue(changedPreview.canApply());
        assertEquals(1, changedPreview.updated());

        applyService.apply(changed, changedPreview.previewDigest());

        assertEquals("MULTIPLE_CHOICE", jdbc.queryForObject(
                "select question_type from question where id = ?", String.class, questionId));
        assertEquals(0, jdbc.queryForObject(
                "select count(*) from question_answer where question_id = ? and answer_kind = 'ACCEPTED_TEXT'",
                Integer.class,
                questionId));
        assertEquals(1, jdbc.queryForObject(
                "select count(*) from question_answer where question_id = ? and answer_kind = 'CORRECT_CHOICE'",
                Integer.class,
                questionId));
        assertEquals("B", jdbc.queryForObject(
                "select choice.choice_key from question_answer answer "
                        + "join question_choice choice on choice.id = answer.choice_id "
                        + "where answer.question_id = ? and answer.answer_kind = 'CORRECT_CHOICE'",
                String.class,
                questionId));
        assertEquals(2, jdbc.queryForObject(
                "select count(*) from question_choice where question_id = ?",
                Integer.class,
                questionId));

        ImportPreviewResult identicalPreview = previewService.preview(changed);
        assertTrue(identicalPreview.canApply());
        assertEquals(0, identicalPreview.updated());
        assertEquals(4, identicalPreview.unchanged());
    }

    private long acceptedAnswerId(long questionId, String answerText) {
        return jdbc.queryForObject(
                "select id from question_answer where question_id = ? and answer_kind = 'ACCEPTED_TEXT' "
                        + "and lower(btrim(answer_text)) = lower(btrim(?))",
                Long.class,
                questionId,
                answerText);
    }

    private ImportFilesCommand shortAnswerCommand(List<String> conceptKeys) {
        String concepts = conceptKeys.stream()
                .map(key -> "\"" + key + "\"")
                .reduce((left, right) -> left + "," + right)
                .orElseThrow();
        String question = "{\"kind\":\"question\",\"contentKey\":\"test.short-answer\","
                + "\"promptMarkdown\":\"경계값을 쓰세요.\",\"questionType\":\"SHORT_ANSWER\","
                + "\"difficulty\":\"EASY\",\"status\":\"PUBLISHED\",\"conceptKeys\":[" + concepts + "],"
                + "\"acceptedAnswers\":[\"10000000\",\"-128\"],"
                + "\"explanationMarkdown\":\"허용 답안을 확인한다.\"}";
        return command(question);
    }

    private ImportFilesCommand multipleChoiceCommand() {
        String question = "{\"kind\":\"question\",\"contentKey\":\"test.short-answer\","
                + "\"promptMarkdown\":\"DNS와 TLS의 역할을 가장 잘 구분한 것은?\","
                + "\"questionType\":\"MULTIPLE_CHOICE\",\"difficulty\":\"EASY\","
                + "\"status\":\"PUBLISHED\",\"conceptKeys\":[\"test.concept.a\"],"
                + "\"choices\":["
                + "{\"key\":\"A\",\"content\":\"역할이 뒤바뀌었다.\",\"rationaleMarkdown\":\"오답이다.\",\"displayOrder\":0},"
                + "{\"key\":\"B\",\"content\":\"DNS는 이름을 해석하고 TLS는 보안 채널을 제공한다.\","
                + "\"rationaleMarkdown\":\"정답이다.\",\"displayOrder\":1}],"
                + "\"correctChoiceKey\":\"B\",\"explanationMarkdown\":\"두 역할을 구분한다.\"}";
        return command(question);
    }

    private ImportFilesCommand command(String question) {
        String topic = "{\"kind\":\"topic\",\"contentKey\":\"test.topic\",\"areaSlug\":\"java\","
                + "\"slug\":\"test-topic\",\"title\":\"Test topic\"}";
        String conceptA = "{\"kind\":\"concept\",\"contentKey\":\"test.concept.a\","
                + "\"topicContentKey\":\"test.topic\",\"slug\":\"concept-a\",\"title\":\"Concept A\","
                + "\"contentMarkdown\":\"Concept A body\",\"level\":1,\"status\":\"PUBLISHED\"}";
        String conceptB = "{\"kind\":\"concept\",\"contentKey\":\"test.concept.b\","
                + "\"topicContentKey\":\"test.topic\",\"slug\":\"concept-b\",\"title\":\"Concept B\","
                + "\"contentMarkdown\":\"Concept B body\",\"level\":1,\"status\":\"PUBLISHED\"}";
        return new ImportFilesCommand(List.of(
                source("topic.json", topic),
                source("concept-a.json", conceptA),
                source("concept-b.json", conceptB),
                source("question.json", question)));
    }

    private static ImportSourceFile source(String name, String content) {
        return new ImportSourceFile(name, content.getBytes(StandardCharsets.UTF_8));
    }
}
