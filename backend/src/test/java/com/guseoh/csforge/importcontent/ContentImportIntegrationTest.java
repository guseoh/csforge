package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** PostgreSQL에서 preview, atomic apply, 재import 계약을 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ContentImportIntegrationTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_import_test").withUsername("csforge").withPassword("csforge");
    private static final HttpClient HTTP = HttpClient.newHttpClient();
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper objectMapper;
    @Value("${local.server.port}") int port;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @BeforeEach
    void cleanCanonicalContent() {
        jdbc.execute("drop trigger if exists test_import_failure_trigger on topic");
        jdbc.execute("drop function if exists test_import_failure()");
        jdbc.update("delete from review_history"); jdbc.update("delete from review_schedule"); jdbc.update("delete from wrong_note");
        jdbc.update("delete from attempt"); jdbc.update("delete from quiz_question"); jdbc.update("delete from quiz_session");
        jdbc.update("delete from question_concept"); jdbc.update("delete from question_answer"); jdbc.update("delete from question_choice");
        jdbc.update("delete from question"); jdbc.update("delete from concept_reference"); jdbc.update("delete from personal_note");
        jdbc.update("delete from concept_progress"); jdbc.update("delete from concept"); jdbc.update("delete from reference"); jdbc.update("delete from topic");
    }

    @Test
    void previewApplyAndIdenticalReimportAreDeterministic() throws Exception {
        List<Part> parts = sampleParts();
        JsonNode preview = json(post("/api/imports/preview", parts, null));
        assertEquals(200, preview.get("status").asInt());
        JsonNode body = preview.get("body");
        assertEquals(3, body.get("totals").get("created").asInt());
        assertEquals(0, jdbc.queryForObject("select count(*) from topic", Integer.class));
        JsonNode applied = json(post("/api/imports/apply", parts, body.get("previewDigest").asText()));
        assertEquals(200, applied.get("status").asInt());
        assertEquals(1, jdbc.queryForObject("select count(*) from topic", Integer.class));
        long topicId = jdbc.queryForObject("select id from topic where content_key = 'test.topic'", Long.class);
        String createdAt = jdbc.queryForObject("select created_at::text from topic where content_key = 'test.topic'", String.class);
        String updatedAt = jdbc.queryForObject("select updated_at::text from topic where content_key = 'test.topic'", String.class);
        JsonNode secondPreview = json(post("/api/imports/preview", parts, null)).get("body");
        assertEquals(3, secondPreview.get("totals").get("unchanged").asInt());
        assertTrue(secondPreview.get("canApply").asBoolean());
        post("/api/imports/apply", parts, secondPreview.get("previewDigest").asText());
        assertEquals(topicId, jdbc.queryForObject("select id from topic where content_key = 'test.topic'", Long.class));
        assertEquals(createdAt, jdbc.queryForObject("select created_at::text from topic where content_key = 'test.topic'", String.class));
        assertEquals(updatedAt, jdbc.queryForObject("select updated_at::text from topic where content_key = 'test.topic'", String.class));
    }

    @Test
    void stalePreviewIsRejectedBeforeAnyMutation() throws Exception {
        List<Part> parts = sampleParts();
        JsonNode initial = json(post("/api/imports/preview", parts, null)).get("body");
        post("/api/imports/apply", parts, initial.get("previewDigest").asText());
        JsonNode preview = json(post("/api/imports/preview", parts, null)).get("body");
        jdbc.update("update topic set title = 'Concurrent change' where content_key = 'test.topic'");
        JsonNode response = json(post("/api/imports/apply", parts, preview.get("previewDigest").asText()));
        assertEquals(409, response.get("status").asInt());
        assertEquals("IMPORT_PREVIEW_STALE", response.get("body").get("code").asText());
        assertEquals("Concurrent change", jdbc.queryForObject("select title from topic where content_key = 'test.topic'", String.class));
    }

    @Test
    void attemptCreatedAfterPreviewMakesStructuralApplyStale() throws Exception {
        List<Part> base = sampleParts();
        JsonNode initial = json(post("/api/imports/preview", base, null)).get("body");
        post("/api/imports/apply", base, initial.get("previewDigest").asText());
        List<Part> changed = List.of(base.get(0), base.get(1),
                new Part("question.json", "application/json", "{\"kind\":\"question\",\"contentKey\":\"test.q1\",\"promptMarkdown\":\"Choose\",\"questionType\":\"MULTIPLE_CHOICE\",\"difficulty\":\"EASY\",\"status\":\"PUBLISHED\",\"conceptKeys\":[\"test.concept\"],\"choices\":[{\"key\":\"A\",\"content\":\"changed\",\"displayOrder\":0},{\"key\":\"B\",\"content\":\"no\",\"displayOrder\":1}],\"correctChoiceKey\":\"A\"}"));
        JsonNode preview = json(post("/api/imports/preview", changed, null)).get("body");
        assertTrue(preview.get("canApply").asBoolean());
        long questionId = jdbc.queryForObject("select id from question where content_key = 'test.q1'", Long.class);
        long sessionId = jdbc.queryForObject("insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id", Long.class);
        jdbc.update("insert into attempt (quiz_session_id, question_id) values (?, ?)", sessionId, questionId);

        JsonNode afterAttemptPreview = json(post("/api/imports/preview", changed, null)).get("body");
        JsonNode response = json(post("/api/imports/apply", changed, preview.get("previewDigest").asText()));

        assertFalse(afterAttemptPreview.get("canApply").asBoolean());
        assertEquals(409, response.get("status").asInt());
        assertEquals("IMPORT_PREVIEW_STALE", response.get("body").get("code").asText());
        assertEquals("yes", jdbc.queryForObject("select content_markdown from question_choice where question_id = ? and choice_key = 'A'", String.class, questionId));
    }

    @Test
    void anyPreviewErrorBlocksApplyWithoutMutation() throws Exception {
        List<Part> invalid = List.of(
                new Part("new-topic.json", "application/json", "{\"kind\":\"topic\",\"contentKey\":\"new.topic\",\"areaSlug\":\"unknown\",\"slug\":\"new\",\"title\":\"New\"}"),
                new Part("invalid-question.json", "application/json", "{\"kind\":\"question\",\"contentKey\":\"invalid.q\",\"promptMarkdown\":\"P\",\"questionType\":\"MULTIPLE_CHOICE\",\"difficulty\":\"EASY\",\"status\":\"DRAFT\",\"conceptKeys\":[\"missing.concept\"],\"choices\":[{\"key\":\"A\",\"content\":\"A\",\"displayOrder\":0}],\"correctChoiceKey\":\"B\"}"));
        JsonNode preview = json(post("/api/imports/preview", invalid, null)).get("body");
        assertFalse(preview.get("canApply").asBoolean());

        JsonNode response = json(post("/api/imports/apply", invalid, preview.get("previewDigest").asText()));

        assertEquals(400, response.get("status").asInt());
        assertEquals(0, jdbc.queryForObject("select count(*) from topic where content_key = 'new.topic'", Integer.class));
    }

    @Test
    void referenceBlankAndItemBatchBoundAreRejectedDuringPreview() throws Exception {
        List<Part> blankReference = List.of(new Part("concept.json", "application/json", "{\"kind\":\"concept\",\"contentKey\":\"blank.ref\",\"topicContentKey\":\"missing.topic\",\"slug\":\"blank\",\"title\":\"Blank\",\"contentMarkdown\":\"Body\",\"level\":1,\"references\":[{\"url\":\"  \",\"title\":\"  \"}]}"));
        assertFalse(json(post("/api/imports/preview", blankReference, null)).get("body").get("canApply").asBoolean());

        StringBuilder array = new StringBuilder("[");
        for (int i = 0; i < 1001; i++) {
            if (i > 0) array.append(',');
            array.append("{\"kind\":\"topic\",\"contentKey\":\"bound.").append(i).append("\",\"areaSlug\":\"java\",\"slug\":\"bound-").append(i).append("\",\"title\":\"Bound\"}");
        }
        array.append(']');
        assertEquals(400, post("/api/imports/preview", List.of(new Part("bound.json", "application/json", array.toString())), null).statusCode());
    }

    @Test
    void conceptAndQuestionCanonicalUpdatesPreserveLearningAndHistory() throws Exception {
        List<Part> base = sampleParts();
        JsonNode initial = json(post("/api/imports/preview", base, null)).get("body");
        post("/api/imports/apply", base, initial.get("previewDigest").asText());
        long conceptId = jdbc.queryForObject("select id from concept where content_key = 'test.concept'", Long.class);
        jdbc.update("insert into concept_progress (concept_id, status, bookmarked) values (?, 'LEARNING', true)", conceptId);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'keep this note')", conceptId);
        long questionId = jdbc.queryForObject("select id from question where content_key = 'test.q1'", Long.class);
        long attemptId = insertAttempt(questionId);
        jdbc.update("insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) values (?, 'ACTIVE', 2, current_timestamp, current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_schedule (question_id, status, stage, due_at, last_reviewed_at, last_processed_attempt_id) values (?, 'SCHEDULED', 1, current_timestamp + interval '1 day', current_timestamp, ?)", questionId, attemptId);
        jdbc.update("insert into review_history (question_id, quiz_session_id, attempt_id, result, stage_before, stage_after, reviewed_at, next_due_at) select question_id, quiz_session_id, id, 'WRONG', 1, 1, current_timestamp, current_timestamp + interval '1 day' from attempt where id = ?", attemptId);
        String changedConcept = "{\"kind\":\"concept\",\"contentKey\":\"test.concept\",\"topicContentKey\":\"test.topic\",\"slug\":\"test\",\"title\":\"Changed concept\",\"contentMarkdown\":\"# Changed\",\"level\":1,\"status\":\"PUBLISHED\"}";
        String changedQuestion = "{\"kind\":\"question\",\"contentKey\":\"test.q1\",\"promptMarkdown\":\"Changed prompt\",\"questionType\":\"MULTIPLE_CHOICE\",\"difficulty\":\"MEDIUM\",\"status\":\"PUBLISHED\",\"conceptKeys\":[\"test.concept\"],\"choices\":[{\"key\":\"A\",\"content\":\"yes\",\"displayOrder\":0},{\"key\":\"B\",\"content\":\"no\",\"displayOrder\":1}],\"correctChoiceKey\":\"A\"}";
        List<Part> changed = List.of(base.get(0), new Part("concept.json", "application/json", changedConcept), new Part("question.json", "application/json", changedQuestion));
        JsonNode preview = json(post("/api/imports/preview", changed, null)).get("body");

        assertTrue(preview.get("canApply").asBoolean());
        assertEquals(200, post("/api/imports/apply", changed, preview.get("previewDigest").asText()).statusCode());
        assertEquals(1, jdbc.queryForObject("select count(*) from concept_progress where concept_id = ? and status = 'LEARNING' and bookmarked = true", Integer.class, conceptId));
        assertEquals("keep this note", jdbc.queryForObject("select content from personal_note where concept_id = ?", String.class, conceptId));
        assertEquals(1, jdbc.queryForObject("select count(*) from attempt where question_id = ?", Integer.class, questionId));
        assertEquals(1, jdbc.queryForObject("select count(*) from wrong_note where question_id = ?", Integer.class, questionId));
        assertEquals(1, jdbc.queryForObject("select count(*) from review_schedule where question_id = ?", Integer.class, questionId));
        assertEquals(1, jdbc.queryForObject("select count(*) from review_history where question_id = ?", Integer.class, questionId));
        assertEquals("Changed prompt", jdbc.queryForObject("select prompt_markdown from question where id = ?", String.class, questionId));
    }

    @Test
    void existingUniqueSlugConflictIsPreviewError() throws Exception {
        jdbc.update("insert into topic (learning_area_id, content_key, slug, title, display_order, active) select id, 'existing.conflict', 'taken', 'Existing', 0, true from learning_area where slug = 'java'");
        List<Part> parts = List.of(new Part("conflict.json", "application/json", "{\"kind\":\"topic\",\"contentKey\":\"new.conflict\",\"areaSlug\":\"java\",\"slug\":\"taken\",\"title\":\"Conflict\"}"));

        JsonNode preview = json(post("/api/imports/preview", parts, null)).get("body");

        assertFalse(preview.get("canApply").asBoolean());
        assertEquals("ERROR", preview.get("items").get(0).get("classification").asText());
        assertEquals(1, jdbc.queryForObject("select count(*) from topic", Integer.class));
    }

    @Test
    void topicSlugCreatedAfterPreviewMakesApplyStale() throws Exception {
        List<Part> parts = List.of(new Part("topic.json", "application/json", "{\"kind\":\"topic\",\"contentKey\":\"new.topic\",\"areaSlug\":\"java\",\"slug\":\"free\",\"title\":\"New\"}"));
        JsonNode preview = json(post("/api/imports/preview", parts, null)).get("body");
        jdbc.update("insert into topic (learning_area_id, content_key, slug, title, display_order, active) select id, 'concurrent.topic', 'free', 'Concurrent', 0, true from learning_area where slug = 'java'");

        JsonNode response = json(post("/api/imports/apply", parts, preview.get("previewDigest").asText()));

        assertEquals(409, response.get("status").asInt());
        assertEquals("IMPORT_PREVIEW_STALE", response.get("body").get("code").asText());
        assertEquals(0, jdbc.queryForObject("select count(*) from topic where content_key = 'new.topic'", Integer.class));
    }

    @Test
    void conceptSlugCreatedAfterPreviewMakesApplyStale() throws Exception {
        jdbc.update("insert into topic (learning_area_id, content_key, slug, title, display_order, active) select id, 'test.topic', 'test', 'Test', 0, true from learning_area where slug = 'java'");
        List<Part> parts = List.of(new Part("concept.json", "application/json", "{\"kind\":\"concept\",\"contentKey\":\"new.concept\",\"topicContentKey\":\"test.topic\",\"slug\":\"free\",\"title\":\"New\",\"contentMarkdown\":\"Body\",\"level\":1,\"status\":\"DRAFT\"}"));
        JsonNode preview = json(post("/api/imports/preview", parts, null)).get("body");
        long topicId = jdbc.queryForObject("select id from topic where content_key = 'test.topic'", Long.class);
        jdbc.update("insert into concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) values (?, 'concurrent.concept', 'free', 'Concurrent', 'Body', 1, 'DRAFT', 0)", topicId);

        JsonNode response = json(post("/api/imports/apply", parts, preview.get("previewDigest").asText()));

        assertEquals(409, response.get("status").asInt());
        assertEquals("IMPORT_PREVIEW_STALE", response.get("body").get("code").asText());
        assertEquals(0, jdbc.queryForObject("select count(*) from concept where content_key = 'new.concept'", Integer.class));
    }

    @Test
    void applyFailureRollsBackEarlierCanonicalMutations() throws Exception {
        jdbc.execute("create function test_import_failure() returns trigger language plpgsql as $$ begin if NEW.content_key = 'new.second' then raise exception 'forced apply failure'; end if; return NEW; end $$");
        jdbc.execute("create trigger test_import_failure_trigger before insert on topic for each row execute function test_import_failure()");
        List<Part> parts = List.of(new Part("topics.json", "application/json", "[{\"kind\":\"topic\",\"contentKey\":\"new.first\",\"areaSlug\":\"java\",\"slug\":\"fresh\",\"title\":\"Fresh\"},{\"kind\":\"topic\",\"contentKey\":\"new.second\",\"areaSlug\":\"java\",\"slug\":\"taken\",\"title\":\"Conflict\"}]"));
        JsonNode preview = json(post("/api/imports/preview", parts, null)).get("body");

        assertTrue(preview.get("canApply").asBoolean());
        assertNotEquals(200, post("/api/imports/apply", parts, preview.get("previewDigest").asText()).statusCode());
        assertEquals(0, jdbc.queryForObject("select count(*) from topic where content_key = 'new.first'", Integer.class));
    }

    private long insertAttempt(long questionId) {
        long sessionId = jdbc.queryForObject("insert into quiz_session (started_at, source) values (current_timestamp, 'STANDARD') returning id", Long.class);
        return jdbc.queryForObject("insert into attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) values (?, ?, 'GRADED', false, current_timestamp, current_timestamp) returning id", Long.class, sessionId, questionId);
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        return objectMapper.readTree("{\"status\":" + response.statusCode() + ",\"body\":" + response.body() + "}");
    }

    private HttpResponse<String> post(String path, List<Part> parts, String digest) throws Exception {
        String boundary = "----csforge-" + UUID.randomUUID();
        List<byte[]> chunks = new ArrayList<>();
        for (Part part : parts) chunks.add(part.file(boundary));
        if (digest != null) chunks.add(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"previewDigest\"\r\n\r\n" + digest + "\r\n").getBytes(StandardCharsets.UTF_8));
        chunks.add(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        int length = chunks.stream().mapToInt(bytes -> bytes.length).sum(); byte[] body = new byte[length]; int offset = 0;
        for (byte[] chunk : chunks) { System.arraycopy(chunk, 0, body, offset, chunk.length); offset += chunk.length; }
        return HTTP.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).header("Content-Type", "multipart/form-data; boundary=" + boundary).POST(HttpRequest.BodyPublishers.ofByteArray(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private static List<Part> sampleParts() {
        return List.of(
                new Part("topic.json", "application/json", "{\"kind\":\"topic\",\"contentKey\":\"test.topic\",\"areaSlug\":\"java\",\"slug\":\"test\",\"title\":\"Test topic\"}"),
                new Part("concept.md", "text/markdown", "---\nkind: concept\ncontentKey: test.concept\ntopicContentKey: test.topic\nslug: test\ntitle: Test concept\nlevel: 1\nstatus: PUBLISHED\n---\n# Test\n"),
                new Part("question.json", "application/json", "{\"kind\":\"question\",\"contentKey\":\"test.q1\",\"promptMarkdown\":\"Choose\",\"questionType\":\"MULTIPLE_CHOICE\",\"difficulty\":\"EASY\",\"status\":\"PUBLISHED\",\"conceptKeys\":[\"test.concept\"],\"choices\":[{\"key\":\"A\",\"content\":\"yes\",\"displayOrder\":0},{\"key\":\"B\",\"content\":\"no\",\"displayOrder\":1}],\"correctChoiceKey\":\"A\"}"));
    }

    private record Part(String name, String type, String content) {
        byte[] file(String boundary) { return ("--" + boundary + "\r\nContent-Disposition: form-data; name=\"files\"; filename=\"" + name + "\"\r\nContent-Type: " + type + "\r\n\r\n" + content + "\r\n").getBytes(StandardCharsets.UTF_8); }
    }
}
