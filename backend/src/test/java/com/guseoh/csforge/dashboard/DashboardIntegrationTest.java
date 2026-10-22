package com.guseoh.csforge.dashboard;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;

import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
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
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_test");

    @DynamicPropertySource
    static void registerDatabaseProperties(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
        registry.add("csforge.time-zone", () -> "Asia/Seoul");
    }

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    EntityManagerFactory entityManagerFactory;

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
        jdbc.update("DELETE FROM review_history");
        jdbc.update("DELETE FROM review_schedule");
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

        Instant previousView = NOW.minusSeconds(3600);
        jdbc.update("UPDATE concept_progress SET last_viewed_at = ? WHERE concept_id = ?",
                sqlTimestamp(previousView), conceptId);
        assertTrue(jdbc.queryForObject(
                "SELECT last_viewed_at = ? FROM concept_progress WHERE concept_id = ?",
                Boolean.class, sqlTimestamp(previousView), conceptId));

        jdbc.execute("CREATE OR REPLACE FUNCTION fail_dashboard_history_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'history failure'; END; $$");
        jdbc.execute("CREATE TRIGGER fail_dashboard_history BEFORE INSERT ON concept_view_history FOR EACH ROW EXECUTE FUNCTION fail_dashboard_history_insert()");
        try {
            assertTrue(request("POST", "/api/concepts/" + conceptId + "/view", null).statusCode() >= 500);
        } finally {
            jdbc.execute("DROP TRIGGER fail_dashboard_history ON concept_view_history");
            jdbc.execute("DROP FUNCTION fail_dashboard_history_insert()");
        }

        assertTrue(jdbc.queryForObject(
                "SELECT last_viewed_at = ? FROM concept_progress WHERE concept_id = ?",
                Boolean.class, sqlTimestamp(previousView), conceptId));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_progress WHERE concept_id = ?", Integer.class, conceptId));
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_view_history WHERE concept_id = ?", Integer.class, conceptId));
    }

    @Test
    void dashboardUsesSeoulBoundaryAndAggregatesAreaWeakRecentAndPendingSelfCheck() throws Exception {
        jdbc.update("INSERT INTO concept_progress (concept_id, status, first_viewed_at, last_viewed_at, completed_at) VALUES (?, 'COMPLETED', ?, ?, ?)",
                conceptId,
                sqlTimestamp(Instant.parse("2026-09-02T15:00:00Z")),
                sqlTimestamp(Instant.parse("2026-09-03T01:00:00Z")),
                sqlTimestamp(NOW));
        jdbc.update("INSERT INTO concept_view_history (concept_id, viewed_at) VALUES (?, ?), (?, ?)",
                conceptId,
                sqlTimestamp(Instant.parse("2026-09-02T15:00:00Z")),
                conceptId,
                sqlTimestamp(Instant.parse("2026-09-03T01:00:00Z")));

        for (int index = 0; index < 3; index++) {
            Instant activityAt = index == 2
                    ? Instant.parse("2026-09-02T14:00:00Z")
                    : NOW.minusSeconds(index * 60L);
            long sessionId = insertSession(index == 2 ? "SUBMITTED" : "COMPLETED", activityAt);
            jdbc.update("INSERT INTO quiz_question (quiz_session_id, question_id, position) VALUES (?, ?, 0)", sessionId, questionId);
            jdbc.update("INSERT INTO attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) VALUES (?, ?, 'GRADED', ?, ?, ?)",
                    sessionId, questionId, index == 0, sqlTimestamp(activityAt), sqlTimestamp(activityAt));
        }
        long pendingSessionId = insertSession("SUBMITTED", NOW.minusSeconds(600));
        jdbc.update("INSERT INTO quiz_question (quiz_session_id, question_id, position) VALUES (?, ?, 0)", pendingSessionId, questionId);
        jdbc.update("INSERT INTO attempt (quiz_session_id, question_id, grading_status, correct, answered_at, graded_at) VALUES (?, ?, 'SELF_CHECK_REQUIRED', NULL, ?, ?)",
                pendingSessionId, questionId, sqlTimestamp(NOW.minusSeconds(600)), sqlTimestamp(NOW.minusSeconds(600)));

        HttpResponse<String> dashboardResponse = request("GET", "/api/dashboard", null);
        assertEquals(200, dashboardResponse.statusCode());
        JsonNode dashboard = objectMapper.readTree(dashboardResponse.body());
        assertEquals("2026-09-03", dashboard.get("studyDate").asText());
        assertEquals("Asia/Seoul", dashboard.get("zoneId").asText());
        assertEquals(365, dashboard.get("heatmap").size());
        assertEquals(15, dashboard.get("areaProgress").size());
        JsonNode javaArea = findBySlug(dashboard.get("areaProgress"), "java");
        assertEquals(1, javaArea.get("completedConceptCount").asInt());
        assertEquals(1, javaArea.get("startedConceptCount").asInt());
        assertEquals(2, javaArea.get("publishedConceptCount").asInt());
        assertEquals(2, dashboard.get("today").get("solvedCount").asInt());
        assertEquals(50.0, dashboard.get("today").get("accuracyPercent").asDouble());
        assertEquals(3, dashboard.get("weakTopics").get(0).get("attemptCount").asInt());
        assertTrue(hasPendingSelfCheck(dashboard.get("recentQuizzes")));
    }

    @Test
    void dashboardCountsLearningAsStartedWithoutIncreasingCompletion() throws Exception {
        assertEquals(200, request("POST", "/api/concepts/" + conceptId + "/view", null).statusCode());

        JsonNode dashboard = objectMapper.readTree(request("GET", "/api/dashboard", null).body());
        JsonNode javaArea = findBySlug(dashboard.get("areaProgress"), "java");

        assertEquals(1, javaArea.get("startedConceptCount").asInt());
        assertEquals(0, javaArea.get("completedConceptCount").asInt());
        assertEquals(0.0, javaArea.get("completionPercent").asDouble());
    }

    @Test
    void resultAndDashboardUseTheSameAccuracyWithUnansweredAndPendingQuestions() throws Exception {
        long wrongQuestionId = insertQuestion("dashboard-wrong-question");
        long unansweredQuestionId = insertQuestion("dashboard-unanswered-question");
        long pendingQuestionId = insertQuestion("dashboard-pending-question", "DESCRIPTIVE");
        List<Long> questionIds = List.of(questionId, wrongQuestionId, unansweredQuestionId, pendingQuestionId);
        questionIds.stream().skip(1).forEach(id -> jdbc.update(
                "INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)", id, conceptId));

        long quizId = insertSession("SUBMITTED", NOW.minusSeconds(300));
        for (int index = 0; index < questionIds.size(); index++) {
            long currentQuestionId = questionIds.get(index);
            jdbc.update("INSERT INTO quiz_question (quiz_session_id, question_id, position) VALUES (?, ?, ?)",
                    quizId, currentQuestionId, index);
            switch (index) {
                case 0 -> insertAttempt(quizId, currentQuestionId, "GRADED", true, "정답");
                case 1 -> insertAttempt(quizId, currentQuestionId, "GRADED", false, "오답");
                case 2 -> insertAttempt(quizId, currentQuestionId, "GRADED", false, null);
                case 3 -> insertAttempt(quizId, currentQuestionId, "SELF_CHECK_REQUIRED", null, "자기채점 답안");
                default -> throw new IllegalStateException("Unexpected fixture question position: " + index);
            }
        }

        JsonNode result = objectMapper.readTree(request("GET", "/api/quizzes/" + quizId + "/result", null).body());
        JsonNode dashboard = objectMapper.readTree(request("GET", "/api/dashboard", null).body());
        JsonNode recentQuiz = findRecentQuiz(dashboard.get("recentQuizzes"), quizId);

        assertEquals(4, result.get("total").asInt());
        assertEquals(1, result.get("correct").asInt());
        assertEquals(1, result.get("wrong").asInt());
        assertEquals(1, result.get("unanswered").asInt());
        assertEquals(1, result.get("selfCheckPending").asInt());
        assertEquals(1.0 / 3.0, result.get("accuracy").asDouble(), 0.0001);
        assertEquals(3, recentQuiz.get("finalizedCount").asInt());
        assertEquals(1, recentQuiz.get("correctCount").asInt());
        assertEquals(1, recentQuiz.get("wrongCount").asInt());
        assertEquals(1, recentQuiz.get("unansweredCount").asInt());
        assertEquals(1, recentQuiz.get("pendingSelfCheckCount").asInt());
        assertEquals(100.0 / 3.0, recentQuiz.get("accuracyPercent").asDouble(), 0.001);

        assertEquals(200, request("PATCH",
                "/api/quizzes/" + quizId + "/questions/" + pendingQuestionId + "/self-check",
                "{\"correct\":true}").statusCode());
        JsonNode checkedResult = objectMapper.readTree(request("GET", "/api/quizzes/" + quizId + "/result", null).body());
        JsonNode updatedDashboard = objectMapper.readTree(request("GET", "/api/dashboard", null).body());
        JsonNode updatedRecentQuiz = findRecentQuiz(updatedDashboard.get("recentQuizzes"), quizId);

        assertEquals(0.5, checkedResult.get("accuracy").asDouble(), 0.0001);
        assertEquals(50.0, updatedRecentQuiz.get("accuracyPercent").asDouble(), 0.001);
        assertEquals(4, updatedRecentQuiz.get("finalizedCount").asInt());
        assertEquals(0, updatedRecentQuiz.get("pendingSelfCheckCount").asInt());
    }


    @Test
    void insightsUseStudyDayBoundariesAndTreatPendingAndUnansweredAsSeparate() throws Exception {
        JsonNode empty = objectMapper.readTree(request("GET", "/api/learning-insights?range=7d", null).body());
        assertEquals("2026-09-03", empty.get("studyDate").asText());
        assertEquals("Asia/Seoul", empty.get("zoneId").asText());
        assertEquals("2026-08-28", empty.get("current").get("from").asText());
        assertEquals("2026-08-21", empty.get("previous").get("from").asText());
        assertTrue(empty.get("current").get("accuracyPercent").isNull());
        assertFalse(empty.get("comparable").asBoolean());
        assertEquals(0, empty.get("weakConcepts").size());

        // 2026-08-28 00:00 KST lies exactly at the start of the 7d window.
        long first = insertSession("SUBMITTED", Instant.parse("2026-08-27T15:00:00Z"));
        jdbc.update("""
                insert into attempt (quiz_session_id, question_id, grading_status, correct, answer_text, answered_at, graded_at)
                values (?, ?, 'GRADED', true, 'ok', ?, ?)
                """, first, questionId, sqlTimestamp(Instant.parse("2026-08-27T15:00:00Z")),
                sqlTimestamp(Instant.parse("2026-08-27T15:00:00Z")));
        long earlier = insertSession("SUBMITTED", Instant.parse("2026-08-27T14:59:59Z"));
        jdbc.update("""
                insert into attempt (quiz_session_id, question_id, grading_status, correct, answer_text, answered_at, graded_at)
                values (?, ?, 'GRADED', false, 'wrong', ?, ?)
                """, earlier, questionId, sqlTimestamp(Instant.parse("2026-08-27T14:59:59Z")),
                sqlTimestamp(Instant.parse("2026-08-27T14:59:59Z")));

        long pending = insertSession("COMPLETED", NOW.minusSeconds(10));
        insertAttempt(pending, questionId, "SELF_CHECK_REQUIRED", null, "설명은 했지만 채점 대기");
        long unsubmitted = insertSession("IN_PROGRESS", NOW.minusSeconds(10));
        insertAttempt(unsubmitted, questionId, "GRADED", true, "not submitted");
        long unanswered = insertSession("SUBMITTED", NOW.minusSeconds(10));
        insertAttempt(unanswered, questionId, "GRADED", false, null);

        JsonNode data = objectMapper.readTree(request("GET", "/api/learning-insights?range=7d&area=java", null).body());
        assertEquals(1, data.get("current").get("finalizedAttempts").asInt());
        assertEquals(1, data.get("current").get("uniqueQuestions").asInt());
        assertEquals(1, data.get("current").get("pendingSelfCheck").asInt());
        assertEquals(100.0, data.get("current").get("accuracyPercent").asDouble());
        assertEquals(1, data.get("previous").get("finalizedAttempts").asInt());
        assertFalse(data.get("comparable").asBoolean());
        assertEquals(0, data.get("weakConcepts").size());

        JsonNode extended = objectMapper.readTree(request("GET", "/api/learning-insights?range=30d", null).body());
        assertEquals("2026-08-05", extended.get("current").get("from").asText());
        assertEquals(2, extended.get("current").get("finalizedAttempts").asInt());
        assertEquals(400, request("GET", "/api/learning-insights?range=invalid", null).statusCode());
        assertEquals(404, request("GET", "/api/learning-insights?area=unknown", null).statusCode());
    }

    @Test
    void insightsDistinguishRepeatedAttemptsFromDistinctQuestionEvidenceAndReviewDue() throws Exception {
        long second = insertQuestion("insights-second");
        long third = insertQuestion("insights-third");
        jdbc.update("INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?), (?, ?)",
                second, conceptId, third, conceptId);
        long[] questions = { questionId, second, third };

        for (int i = 0; i < questions.length; i++) {
            long quiz = insertSession("COMPLETED", NOW.minusSeconds(100 + i));
            insertAttempt(quiz, questions[i], "GRADED", i == 2, "answer");
        }
        // Extra retries raise activity, not the number of distinct questions.
        for (int i = 0; i < 5; i++) {
            long quiz = insertSession("COMPLETED", NOW.minusSeconds(200 + i));
            insertAttempt(quiz, questionId, "GRADED", false, "retry");
        }
        jdbc.update("""
                insert into concept_view_history (concept_id, viewed_at)
                values (?, ?), (?, ?)
                """, conceptId, sqlTimestamp(NOW.minusSeconds(60)),
                conceptId, sqlTimestamp(NOW.minusSeconds(30)));
        jdbc.update("""
                insert into review_schedule (question_id, status, stage, due_at)
                values (?, 'SCHEDULED', 1, ?), (?, 'SCHEDULED', 1, ?)
                """, questionId, sqlTimestamp(Instant.parse("2026-09-02T14:00:00Z")),
                second, sqlTimestamp(NOW.minusSeconds(15)));

        JsonNode data = objectMapper.readTree(request("GET", "/api/learning-insights?range=7d&area=java", null).body());
        assertEquals(8, data.get("current").get("finalizedAttempts").asInt());
        assertEquals(3, data.get("current").get("uniqueQuestions").asInt());
        assertEquals(1, data.get("current").get("correctAttempts").asInt());
        assertEquals(1, data.get("current").get("viewedConcepts").asInt());
        assertEquals(1, data.get("overdueCount").asInt());
        assertEquals(1, data.get("dueNowCount").asInt());
        assertEquals(1, data.get("weakConcepts").size());
        JsonNode weak = data.get("weakConcepts").get(0);
        assertEquals(conceptId, weak.get("conceptId").asLong());
        assertEquals(7, weak.get("wrongAttempts").asInt());
        assertEquals(2, weak.get("dueQuestions").asInt());
        assertEquals(3, weak.get("distinctQuestions").asInt());
        assertEquals(1, weak.get("correctQuestions").asInt());

        // The overall count is one finalized Attempt per quiz, not one per Concept link.
        assertEquals(8, objectMapper.readTree(request("GET",
                "/api/learning-insights?range=7d", null).body()).get("current").get("finalizedAttempts").asInt());
    }

    @Test
    void insightsComparisonNeedsThreeDistinctQuestionsInEachPeriod() throws Exception {
        for (int i = 0; i < 3; i++) {
            long id = insertQuestion("insights-comparison-" + i);
            jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", id, conceptId);
            long current = insertSession("SUBMITTED", NOW.minusSeconds(i + 30));
            insertAttempt(current, id, "GRADED", true, "answer");
            long old = insertSession("SUBMITTED", Instant.parse("2026-08-25T10:00:00Z"));
            jdbc.update("""
                    insert into attempt (quiz_session_id, question_id, grading_status, correct,
                                         answer_text, answered_at, graded_at)
                    values (?, ?, 'GRADED', false, 'answer', ?, ?)
                    """, old, id, sqlTimestamp(Instant.parse("2026-08-25T10:00:00Z")),
                    sqlTimestamp(Instant.parse("2026-08-25T10:00:00Z")));
        }
        JsonNode data = objectMapper.readTree(request("GET", "/api/learning-insights?range=7d", null).body());
        assertTrue(data.get("comparable").asBoolean());
        assertEquals(100.0, data.get("current").get("accuracyPercent").asDouble());
        assertEquals(0.0, data.get("previous").get("accuracyPercent").asDouble());
    }

    @Test
    void insightsQueryCountDoesNotGrowWithWeakConceptCount() throws Exception {
        long firstQuiz = insertSession("COMPLETED", NOW.minusSeconds(120));
        insertAttempt(firstQuiz, questionId, "GRADED", false, "wrong");
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        boolean previous = statistics.isStatisticsEnabled();
        statistics.setStatisticsEnabled(true);
        try {
            long beforeOne = statistics.getPrepareStatementCount();
            assertEquals(200, request("GET", "/api/learning-insights?range=7d", null).statusCode());
            long one = statistics.getPrepareStatementCount() - beforeOne;
            long otherConcept = insertConcept(topicId, "insights-other", "Insight second", 2);
            long otherQuestion = insertQuestion("insights-other-question");
            jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", otherQuestion, otherConcept);
            long secondQuiz = insertSession("COMPLETED", NOW.minusSeconds(100));
            insertAttempt(secondQuiz, otherQuestion, "GRADED", false, "wrong");
            long beforeTwo = statistics.getPrepareStatementCount();
            assertEquals(200, request("GET", "/api/learning-insights?range=7d", null).statusCode());
            long two = statistics.getPrepareStatementCount() - beforeTwo;
            assertEquals(one, two, "weak Concept summary must not issue N+1 reads");
            assertTrue(two <= 12, "unexpected query count: " + two);
            assertFalse(jdbc.queryForList("""
                    EXPLAIN (ANALYZE, BUFFERS)
                    select question_id from attempt where graded_at >= timestamp '2026-08-27 15:00:00'
                    """, String.class).isEmpty());
        } finally {
            statistics.setStatisticsEnabled(previous);
        }
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
        return insertQuestion("dashboard-question");
    }

    private long insertQuestion(String contentKey) {
        return insertQuestion(contentKey, "SHORT_ANSWER");
    }

    private long insertQuestion(String contentKey, String questionType) {
        return jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status) VALUES (?, 'Question', ?, 'EASY', 'PUBLISHED') RETURNING id",
                Long.class, contentKey, questionType);
    }

    private void insertAttempt(long quizId, long currentQuestionId, String status, Boolean correct, String answerText) {
        Instant gradedAt = NOW.minusSeconds(200);
        jdbc.update("""
                INSERT INTO attempt (quiz_session_id, question_id, grading_status, correct, answer_text, answered_at, graded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, quizId, currentQuestionId, status, correct, answerText,
                answerText == null ? null : sqlTimestamp(gradedAt), sqlTimestamp(gradedAt));
    }

    private long insertSession(String status, Instant startedAt) {
        Timestamp timestamp = sqlTimestamp(startedAt);
        return jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, submitted_at, completed_at, last_position) VALUES (?, 'STANDARD', ?, ?, ?, 0) RETURNING id",
                Long.class, status, timestamp, timestamp, "COMPLETED".equals(status) ? timestamp : null);
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

    private JsonNode findRecentQuiz(JsonNode quizzes, long quizId) {
        for (JsonNode quiz : quizzes) {
            if (quiz.get("quizId").asLong() == quizId) return quiz;
        }
        throw new AssertionError("Recent Quiz not found: " + quizId);
    }

    private static Timestamp sqlTimestamp(Instant instant) {
        return Timestamp.from(instant);
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
