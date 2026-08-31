package com.guseoh.csforge.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LearningIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_test")
            .withUsername("csforge")
            .withPassword("csforge");

    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    @DynamicPropertySource
    static void registerDatabaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ObjectMapper objectMapper;

    @Value("${local.server.port}")
    int port;

    private long topicId;
    private long firstConceptId;
    private long secondConceptId;

    @BeforeEach
    void setUpFixture() {
        jdbc.update("DELETE FROM personal_note");
        jdbc.update("DELETE FROM concept_reference");
        jdbc.update("DELETE FROM concept_progress");
        jdbc.update("DELETE FROM concept");
        jdbc.update("DELETE FROM reference");
        jdbc.update("DELETE FROM topic");

        long javaAreaId = jdbc.queryForObject(
                "SELECT id FROM learning_area WHERE slug = 'java'", Long.class);
        topicId = insertTopic(javaAreaId, "java-basics", "java-basics", "Java basics", 1);
        long secondTopicId = insertTopic(javaAreaId, "jpa-basics", "jpa-basics", "JPA basics", 2);
        firstConceptId = insertConcept(topicId, "java-alpha", "alpha", "Alpha", 1, 1,
                "Alpha summary", "# Alpha\n\nFirst concept.");
        secondConceptId = insertConcept(topicId, "java-beta", "beta", "Beta", 1, 2,
                "Beta summary", "# Beta\n\nSecond concept.");
        insertConcept(secondTopicId, "jpa-alpha", "alpha", "Alpha", 1, 1,
                "JPA summary", "# JPA Alpha\n\nThird concept.");
    }

    @Test
    void flywaySeedsTheFifteenAreasAndAreaSummaryUsesAggregates() throws Exception {
        JsonNode areas = json(request("GET", "/api/learning-areas", null));
        assertEquals(15, areas.size());
        assertEquals("computer-architecture", areas.get(0).get("slug").asText());
        assertEquals("컴퓨터 구조", areas.get(0).get("name").asText());
        assertEquals("database", areas.get(4).get("slug").asText());
        assertEquals("system-design", areas.get(13).get("slug").asText());
        assertEquals("security", areas.get(14).get("slug").asText());
        JsonNode javaArea = findBySlug(areas, "java");
        assertEquals(3, javaArea.get("publishedConceptCount").asInt());
        assertEquals(3, javaArea.get("level1").get("total").asInt());

        JsonNode area = json(request("GET", "/api/learning-areas/java", null));
        assertEquals(2, area.get("topics").size());
        assertEquals(2, area.get("topics").get(0).get("publishedConceptCount").asInt());
        assertEquals(1, area.get("topics").get(1).get("level1Count").asInt());
    }

    @Test
    void conceptListSupportsFiltersPaginationAndStableTitleSort() throws Exception {
        HttpResponse<String> firstPage = request("GET",
                "/api/concepts?area=java&level=1&size=1&page=0&sort=title", null);
        JsonNode firstPageJson = json(firstPage);
        assertEquals(200, firstPage.statusCode());
        assertEquals(3, firstPageJson.get("page").get("totalElements").asInt());
        assertEquals(3, firstPageJson.get("page").get("totalPages").asInt());
        assertTrue(firstPageJson.get("page").get("hasNext").asBoolean());
        assertEquals(firstConceptId, firstPageJson.get("items").get(0).get("id").asLong());
        assertEquals("UNSEEN", firstPageJson.get("items").get(0).get("learningStatus").asText());

        JsonNode filtered = json(request("GET", "/api/concepts?area=java&q=JPA&bookmarked=true", null));
        assertEquals(0, filtered.get("page").get("totalElements").asInt());
    }

    @Test
    void conceptDetailComposesBreadcrumbReferencesNoteAndNavigation() throws Exception {
        long referenceId = insertReference("https://docs.example.test/java", "Java reference");
        jdbc.update("INSERT INTO concept_reference (concept_id, reference_id, display_order, relation_note) VALUES (?, ?, ?, ?)",
                firstConceptId, referenceId, 1, "Start here");

        assertEquals(200, request("POST", "/api/concepts/" + firstConceptId + "/view", null).statusCode());
        assertEquals(200, request("PUT", "/api/concepts/" + firstConceptId + "/note", "{\"content\":\"Remember this\"}").statusCode());

        JsonNode detail = json(request("GET", "/api/concepts/" + firstConceptId, null));
        assertEquals("java", detail.get("area").get("slug").asText());
        assertEquals("java-basics", detail.get("topic").get("slug").asText());
        assertEquals("# Alpha\n\nFirst concept.", detail.get("contentMarkdown").asText());
        assertEquals("LEARNING", detail.get("progress").get("learningStatus").asText());
        assertEquals(1, detail.get("references").size());
        assertEquals("OFFICIAL", detail.get("references").get(0).get("type").asText());
        assertEquals("Remember this", detail.get("personalNote").get("content").asText());
        assertTrue(detail.get("previous").isNull());
        assertEquals(secondConceptId, detail.get("next").get("id").asLong());
        assertEquals(1, detail.get("relatedConcepts").size());
        assertEquals(secondConceptId, detail.get("relatedConcepts").get(0).get("id").asLong());
    }

    @Test
    void viewAndProgressTransitionsAreExplicitAndIdempotent() throws Exception {
        JsonNode viewed = json(request("POST", "/api/concepts/" + firstConceptId + "/view", null));
        assertEquals("LEARNING", viewed.get("learningStatus").asText());
        assertNotNull(viewed.get("firstViewedAt"));
        assertNotNull(viewed.get("lastViewedAt"));

        JsonNode completed = json(request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"status\":\"COMPLETED\"}"));
        assertEquals("COMPLETED", completed.get("learningStatus").asText());
        assertFalse(completed.get("completedAt").isNull());

        JsonNode reviewNeeded = json(request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"status\":\"REVIEW_NEEDED\"}"));
        assertEquals("REVIEW_NEEDED", reviewNeeded.get("learningStatus").asText());
        assertTrue(reviewNeeded.get("completedAt").isNull());

        JsonNode bookmarked = json(request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"bookmarked\":true}"));
        assertTrue(bookmarked.get("bookmarked").asBoolean());
        assertEquals("REVIEW_NEEDED", bookmarked.get("learningStatus").asText());
    }

    @Test
    void personalNoteUpsertKeepsOneRowAndAllowsEmptyAutosave() throws Exception {
        JsonNode first = json(request("PUT", "/api/concepts/" + firstConceptId + "/note", "{\"content\":\"first\"}"));
        assertEquals("first", first.get("content").asText());
        assertNotNull(first.get("updatedAt"));
        assertEquals("second", json(request("PUT", "/api/concepts/" + firstConceptId + "/note", "{\"content\":\"second\"}")).get("content").asText());
        assertEquals("", json(request("PUT", "/api/concepts/" + firstConceptId + "/note", "{\"content\":\"\"}")).get("content").asText());
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM personal_note WHERE concept_id = ?", Integer.class, firstConceptId));
    }

    @Test
    void databaseConstraintsProtectLevelsContentKeysAndOneNotePerConcept() {
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                topicId, "invalid-level", "invalid-level", "Invalid", "content", 4, "PUBLISHED", 99));
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                topicId, "java-alpha", "different-slug", "Duplicate key", "content", 1, "PUBLISHED", 99));
        jdbc.update("INSERT INTO personal_note (concept_id, content) VALUES (?, ?)", firstConceptId, "one");
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "INSERT INTO personal_note (concept_id, content) VALUES (?, ?)", firstConceptId, "two"));
    }

    @Test
    void invalidInputAndMissingResourcesUseTheFeatureErrorShape() throws Exception {
        JsonNode notFound = json(request("GET", "/api/learning-areas/missing", null));
        assertEquals(404, notFound.get("status").asInt());
        assertEquals("LEARNING_NOT_FOUND", notFound.get("code").asText());
        assertEquals(400, request("GET", "/api/concepts?size=101", null).statusCode());
        assertEquals("INVALID_REQUEST", json(request("GET", "/api/concepts?sort=arbitrary", null)).get("code").asText());
        JsonNode validation = json(request("PUT", "/api/concepts/" + firstConceptId + "/note", "{}"));
        assertEquals("VALIDATION_FAILED", validation.get("code").asText());
        assertEquals("content", validation.get("fieldErrors").get(0).get("field").asText());
    }

    private HttpResponse<String> request(String method, String path, String body) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json");
        if (body == null) {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            builder.header("Content-Type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(body));
        }
        return HTTP_CLIENT.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode json(HttpResponse<String> response) throws IOException {
        return objectMapper.readTree(response.body());
    }

    private JsonNode findBySlug(JsonNode areas, String slug) {
        for (JsonNode area : areas) {
            if (slug.equals(area.get("slug").asText())) return area;
        }
        throw new AssertionError("Area not found: " + slug);
    }

    private long insertTopic(long areaId, String contentKey, String slug, String title, int displayOrder) {
        return jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order) VALUES (?, ?, ?, ?, ?) RETURNING id",
                Long.class, areaId, contentKey, slug, title, displayOrder);
    }

    private long insertConcept(long topic, String contentKey, String slug, String title, int level, int displayOrder, String summary, String markdown) {
        return jdbc.queryForObject(
                "INSERT INTO concept (topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, topic, contentKey, slug, title, summary, markdown, level, "PUBLISHED", displayOrder);
    }

    private long insertReference(String url, String title) {
        return jdbc.queryForObject(
                "INSERT INTO reference (url, title, reference_type, language_code, depth, recommendation) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, url, title, "OFFICIAL", "en", "BEGINNER", "Useful reference");
    }
}
