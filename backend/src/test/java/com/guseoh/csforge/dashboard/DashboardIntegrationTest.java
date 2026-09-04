package com.guseoh.csforge.dashboard;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** PostgreSQL에서 V10 history와 Dashboard read model의 대표 흐름을 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(DashboardIntegrationTest.FixedClockConfiguration.class)
class DashboardIntegrationTest {

    private static final Instant NOW = Instant.parse("2026-09-03T14:30:00Z");
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @DynamicPropertySource
    static void registerDatabaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("csforge.time-zone", () -> "Asia/Seoul");
    }

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ObjectMapper objectMapper;

    @Value("${local.server.port}")
    int port;

    private long conceptId;
    private long questionId;
    private long topicId;

    @BeforeEach
    void setUpFixture() {
        jdbc.update("DELETE FROM concept_view_history");
        jdbc.update("DELETE FROM attempt");
        jdbc.update("DELETE FROM quiz_question");
        jdbc.update("DELETE FROM quiz_session");
        jdbc.update("DELETE FROM question_concept");
        jdbc.update("DELETE FROM question");
        jdbc.update("DELETE FROM concept_progress");
        jdbc.update("DELETE FROM concept");
        jdbc.update("DELETE FROM topic");

        long areaId = jdbc.queryForObject("SELECT id FROM learning_area WHERE slug = 'java'", Long.class);
        topicId = insertTopic(areaId);
        conceptId = insertConcept(topicId, "dashboard-concept", "Dashboard concept", 1);
        insertConcept(topicId, "dashboard-concept-two", "Dashboard concept two", 2);
        questionId = insertQuestion();
        jdbc.update("INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)", questionId, conceptId);
    }

    @Test
    void v10MigrationCreatesIndexesAndViewIsAtomicWithProgress() throws Exception {
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE version = '10'", Integer.class));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'concept_view_history_viewed_at_concept_idx'", Integer.class));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'attempt_dashboard_graded_at_idx'", Integer.class));

        assertEquals(200, request("POST", "/api/concepts/" + conceptId + "/view", null).statusCode());
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_progress WHERE concept_id = ? AND first_viewed_at IS NOT NULL AND last_viewed_at IS NOT NULL",
                Integer.class, conceptId));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_view_history WHERE concept_id = ?", Integer.class, conceptId));

        jdbc.execute("CREATE OR REPLACE FUNCTION fail_dashboard_history_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'history failure'; END; $$");
        jdbc.execute("CREATE TRIGGER fail_dashboard_history BEFORE INSERT ON concept_view_history FOR EACH ROW EXECUTE FUNCTION fail_dashboard_history_insert()");
        try {
            assertTrue(request("POST", "/api/concepts/" + conceptId + "/view", null).statusCode() >= 500);
        } finally {
            jdbc.execute("DROP TRIGGER fail_dashboard_history ON concept_view_history");
            jdbc.execute("DROP FUNCTION fail_dashboard_history_insert()");
        }
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_progress WHERE concept_id = ?", Integer.class, conceptId));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_view_history WHERE concept_id = ?", Integer.class, conceptId));
    }

    @Test
    void dashboardUsesSeoulBoundaryAndAggregatesAreaWeakRecentAndPendingSelfCheck() throws Exception {
        jdbc.update("INSERT INTO concept_progress (concept_id, status, first_viewed_at, last_viewed_at, completed_at) VALUES (?, 'COMPLETED', ?, ?, ?)",
                conceptId, Instant.parse("2026-09-02T15:00:00Z"), Instant.parse("2026-09-03T01:00:00Z"), NOW);
        jdbc.update("INSERT INTO concept_view_history (concept_id, viewed_at) VALUES (?, ?), (?, ?)",
                conceptId, Instant.parse("2026-09-02T15:00:00Z"), conceptId, Instant.parse("2026-09-03T01:00:00Z"));

        for (int index = 0; index < 3; index++) {
            Instant activityAt = index == 2
                    ? Instant.parse("2026-09-02T14:00:00Z")
                    : NOW.minusSeconds(index * 60L);
            long sessionId = insertSession(index == 2 ? "SUBMITTED" : "COMPLETED", activityAt);
            jdbc.update("INSERT INTO quiz_question (quiz_session_id, question_id, position) VALUES (?, ?, 0)", sessionId, questionId);
            jdbc.update("INSERT INTO attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) VALUES (?, ?, 'GRADED', ?, ?, ?)",
                    sessionId, questionId, index == 0, activityAt, activityAt);
        }
        long pendingSessionId = insertSession("SUBMITTED", NOW.minusSeconds(600));
        jdbc.update("INSERT INTO quiz_question (quiz_session_id, question_id, position) VALUES (?, ?, 0)", pendingSessionId, questionId);
        jdbc.update("INSERT INTO attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) VALUES (?, ?, 'SELF_CHECK_REQUIRED', NULL, ?, ?)",
                pendingSessionId, questionId, NOW.minusSeconds(600), NOW.minusSeconds(600));

        HttpResponse<String> dashboardResponse = request("GET", "/api/dashboard", null);
        assertEquals(200, dashboardResponse.statusCode());
        JsonNode dashboard = objectMapper.readTree(dashboardResponse.body());
        assertEquals("2026-09-03", dashboard.get("studyDate").asText());
        assertEquals("Asia/Seoul", dashboard.get("zoneId").asText());
        assertEquals(365, dashboard.get("heatmap").size());
        assertEquals(15, dashboard.get("areaProgress").size());
        JsonNode javaArea = findBySlug(dashboard.get("areaProgress"), "java");
        assertEquals(1, javaArea.get("completedConceptCount").asInt());
        assertEquals(2, javaArea.get("publishedConceptCount").asInt());
        assertEquals(2, dashboard.get("today").get("solvedCount").asInt());
        assertEquals(50.0, dashboard.get("today").get("accuracyPercent").asDouble());
        assertEquals(3, dashboard.get("weakTopics").get(0).get("attemptCount").asInt());
        assertTrue(hasPendingSelfCheck(dashboard.get("recentQuizzes")));
    }

    private long insertTopic(long areaId) {
        return jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order) VALUES (?, 'dashboard-topic', 'dashboard-topic', 'Dashboard topic', 1) RETURNING id",
                Long.class, areaId);
    }

    private long insertConcept(long topic, String contentKey, String title, int level) {
        return jdbc.queryForObject(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, 'content', ?, 'PUBLISHED', ?) RETURNING id",
                Long.class, topic, contentKey, contentKey, title, level, level);
    }

    private long insertQuestion() {
        return jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status) VALUES ('dashboard-question', 'Question', 'SHORT_ANSWER', 'EASY', 'PUBLISHED') RETURNING id",
                Long.class);
    }

    private long insertSession(String status, Instant startedAt) {
        return jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, submitted_at, completed_at, last_position) VALUES (?, 'STANDARD', ?, ?, ?, 0) RETURNING id",
                Long.class, status, startedAt, startedAt, "COMPLETED".equals(status) ? startedAt : null);
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

    private JsonNode findBySlug(JsonNode areas, String slug) {
        for (JsonNode area : areas) {
            if (slug.equals(area.get("areaSlug").asText())) return area;
        }
        throw new AssertionError("Area not found: " + slug);
    }

    private boolean hasPendingSelfCheck(JsonNode quizzes) {
        for (JsonNode quiz : quizzes) {
            if (quiz.get("pendingSelfCheckCount").asInt() == 1) return true;
        }
        return false;
    }

    @TestConfiguration
    static class FixedClockConfiguration {
        @Bean
        @Primary
        Clock fixedClock() {
            return Clock.fixed(NOW, ZoneId.of("Asia/Seoul"));
        }
    }
}
