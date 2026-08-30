package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        JsonNode secondPreview = json(post("/api/imports/preview", parts, null)).get("body");
        assertEquals(3, secondPreview.get("totals").get("unchanged").asInt());
        assertTrue(secondPreview.get("canApply").asBoolean());
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
