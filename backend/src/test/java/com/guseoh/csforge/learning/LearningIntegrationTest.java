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
import java.sql.Timestamp;
import java.util.List;

import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.springframework.data.jpa.repository.Query;
import com.guseoh.csforge.learning.infrastructure.ConceptUnderstandingBatchRepository;

import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
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
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_test");

    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    @DynamicPropertySource
    static void registerDatabaseProperties(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    EntityManagerFactory entityManagerFactory;

    @Value("${local.server.port}")
    int port;

    private long topicId;
    private long firstConceptId;
    private long secondConceptId;
    private long thirdConceptId;

    @BeforeEach
    void setUpFixture() {
        jdbc.update("DELETE FROM wrong_answer_analysis");
        jdbc.update("DELETE FROM review_history");
        jdbc.update("DELETE FROM review_schedule");
        jdbc.update("DELETE FROM wrong_note");
        jdbc.update("DELETE FROM attempt");
        jdbc.update("DELETE FROM quiz_question");
        jdbc.update("DELETE FROM quiz_session");
        jdbc.update("DELETE FROM question_concept");
        jdbc.update("DELETE FROM question_answer");
        jdbc.update("DELETE FROM question_choice");
        jdbc.update("DELETE FROM question");
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
        thirdConceptId = insertConcept(secondTopicId, "jpa-alpha", "alpha", "Alpha", 1, 1,
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
        assertEquals(0, javaArea.get("publishedQuestionCount").asInt());
        assertEquals(0, javaArea.get("finalizedAttemptCount").asInt());
        assertEquals(0.0, javaArea.get("accuracyPercent").asDouble());

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
    void areaStartedCountIncludesEveryNonUnseenProgressStatus() throws Exception {
        JsonNode untouched = findBySlug(json(request("GET", "/api/learning-areas", null)), "java");
        assertEquals(0, untouched.get("startedConceptCount").asInt());
        assertEquals(0, untouched.get("completedConceptCount").asInt());

        request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"status\":\"LEARNING\"}");
        request("PATCH", "/api/concepts/" + secondConceptId + "/progress", "{\"status\":\"COMPLETED\"}");
        request("PATCH", "/api/concepts/" + thirdConceptId + "/progress", "{\"status\":\"REVIEW_NEEDED\"}");

        JsonNode javaArea = findBySlug(json(request("GET", "/api/learning-areas", null)), "java");
        assertEquals(3, javaArea.get("startedConceptCount").asInt());
        assertEquals(1, javaArea.get("completedConceptCount").asInt());
    }

    @Test
    void reviewNeededAloneStartsAnAreaWithoutIncreasingCompletion() throws Exception {
        request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"status\":\"REVIEW_NEEDED\"}");

        JsonNode javaArea = findBySlug(json(request("GET", "/api/learning-areas", null)), "java");
        assertEquals(1, javaArea.get("startedConceptCount").asInt());
        assertEquals(0, javaArea.get("completedConceptCount").asInt());
    }

    @Test
    void areaOutlinePaginatesPastTwoHundredAndKeepsOnlyOutlineFields() throws Exception {
        for (int index = 0; index < 205; index++) {
            insertConcept(topicId, "java-outline-" + index, "outline-" + index,
                    "Outline " + index, 1, index + 3, "Outline summary", "# Outline");
        }

        JsonNode firstPage = json(request("GET", "/api/learning-areas/java/outline?page=0&size=200", null));
        assertEquals(208, firstPage.get("page").get("totalElements").asInt());
        assertEquals(200, firstPage.get("items").size());
        assertEquals(2, firstPage.get("page").get("totalPages").asInt());
        assertTrue(firstPage.get("page").get("hasNext").asBoolean());
        assertEquals("Alpha", firstPage.get("items").get(0).get("title").asText());
        assertEquals("Beta", firstPage.get("items").get(1).get("title").asText());
        assertEquals("Outline 197", firstPage.get("items").get(199).get("title").asText());
        assertFalse(firstPage.get("items").get(0).has("contentStatus"));
        assertFalse(firstPage.get("items").get(0).has("bookmarked"));

        JsonNode secondPage = json(request("GET", "/api/learning-areas/java/outline?page=1&size=200", null));
        assertEquals(8, secondPage.get("items").size());
        assertFalse(secondPage.get("page").get("hasNext").asBoolean());
        assertEquals("Outline 204", secondPage.get("items").get(6).get("title").asText());
        assertEquals("Alpha", secondPage.get("items").get(7).get("title").asText());
    }

    @Test
    void areaSummaryCountsPublishedQuestionsAndFinalizedAttemptsWithoutConceptFanout() throws Exception {
        long springAreaId = jdbc.queryForObject("SELECT id FROM learning_area WHERE slug = 'spring'", Long.class);
        long springTopicId = insertTopic(springAreaId, "metrics-spring", "metrics-spring", "Metrics Spring", 1);
        long springConceptId = insertConcept(springTopicId, "metrics-spring-concept", "metrics-spring-concept", "Metrics Spring Concept", 1, 1,
                "Spring metrics", "# Spring metrics");
        long sameAreaQuestion = insertPublishedQuestion("metrics-same-area", "Same area question", firstConceptId, secondConceptId);
        long javaQuestion = insertPublishedQuestion("metrics-java", "Java question", firstConceptId);
        long crossAreaQuestion = insertPublishedQuestion("metrics-cross-area", "Cross area question", firstConceptId, springConceptId);

        insertAttempt(sameAreaQuestion, "GRADED", true);
        insertAttempt(sameAreaQuestion, "SELF_CHECKED", false);
        insertAttempt(javaQuestion, "SELF_CHECK_REQUIRED", null);
        insertAttempt(crossAreaQuestion, "GRADED", true);

        JsonNode areas = json(request("GET", "/api/learning-areas", null));
        JsonNode java = findBySlug(areas, "java");
        JsonNode spring = findBySlug(areas, "spring");
        assertEquals(3, java.get("publishedQuestionCount").asInt());
        assertEquals(3, java.get("finalizedAttemptCount").asInt());
        assertEquals(2, java.get("correctAttemptCount").asInt());
        assertEquals(200.0 / 3.0, java.get("accuracyPercent").asDouble(), 0.01);
        assertEquals(1, spring.get("publishedQuestionCount").asInt());
        assertEquals(1, spring.get("finalizedAttemptCount").asInt());
        assertEquals(1, spring.get("correctAttemptCount").asInt());
        assertEquals(100.0, spring.get("accuracyPercent").asDouble());
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

        JsonNode secondDetail = json(request("GET", "/api/concepts/" + secondConceptId, null));
        assertEquals(firstConceptId, secondDetail.get("previous").get("id").asLong());
        assertEquals(thirdConceptId, secondDetail.get("next").get("id").asLong());
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


    @Test
    void understandingIsUnknownWithoutGradedEvidenceEvenIfReadingIsCompleted() throws Exception {
        JsonNode before = json(request("GET", "/api/concepts/" + firstConceptId + "/understanding", null));
        assertEquals("UNSEEN", before.get("learningStatus").asText());
        assertEquals("NOT_ENOUGH_EVIDENCE", before.get("assessmentStatus").asText());
        assertTrue(before.get("recentAccuracyPercent").isNull());
        assertTrue(before.get("lastAssessedAt").isNull());
        assertEquals(0, before.get("evidence").get("uniqueQuestions").asInt());

        request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"status\":\"COMPLETED\"}");
        JsonNode completed = json(request("GET", "/api/concepts/" + firstConceptId + "/understanding", null));
        assertEquals("COMPLETED", completed.get("learningStatus").asText());
        assertEquals("NOT_ENOUGH_EVIDENCE", completed.get("assessmentStatus").asText());
        assertTrue(completed.get("recentAccuracyPercent").isNull());
        assertEquals(0, completed.get("evidence").get("finalizedAttempts").asInt());
        assertEquals(404, request("GET", "/api/concepts/99999999/understanding", null).statusCode());
    }

    @Test
    void understandingUsesLatestOfDistinctQuestionsAndKeepsRepeatedAttemptsSeparate() throws Exception {
        long q1 = insertPublishedQuestion("understanding-a", "First", firstConceptId, secondConceptId);
        long q2 = insertPublishedQuestion("understanding-b", "Second", firstConceptId);
        long q3 = insertPublishedQuestion("understanding-c", "Third", firstConceptId);
        for (int i = 0; i < 9; i++) insertAttempt(q1, "GRADED", true);
        insertAttempt(q1, "GRADED", false);
        insertAttempt(q2, "GRADED", true);
        insertAttempt(q3, "SELF_CHECKED", true);
        insertAttempt(q2, "SELF_CHECK_REQUIRED", null);

        JsonNode evidence = json(request("GET", "/api/concepts/" + firstConceptId + "/understanding", null));
        assertEquals(3, evidence.get("evidence").get("uniqueQuestions").asInt());
        assertEquals(12, evidence.get("evidence").get("finalizedAttempts").asInt());
        assertEquals(2, evidence.get("evidence").get("correctQuestions").asInt());
        assertEquals(1, evidence.get("evidence").get("pendingSelfCheckCount").asInt());
        assertEquals("DEVELOPING", evidence.get("assessmentStatus").asText());
        assertEquals(66.66666666666667, evidence.get("recentAccuracyPercent").asDouble(), 0.0001);
        assertNotNull(evidence.get("lastAssessedAt"));

        JsonNode shared = json(request("GET", "/api/concepts/" + secondConceptId + "/understanding", null));
        assertEquals(1, shared.get("evidence").get("uniqueQuestions").asInt());
        assertEquals(10, shared.get("evidence").get("finalizedAttempts").asInt());
        assertEquals("NOT_ENOUGH_EVIDENCE", shared.get("assessmentStatus").asText());
        assertTrue(shared.get("recentAccuracyPercent").isNull());
        assertEquals("UNSEEN", shared.get("learningStatus").asText());

        insertAttempt(q1, "SELF_CHECKED", true);
        JsonNode selfChecked = json(request("GET", "/api/concepts/" + firstConceptId + "/understanding", null));
        assertEquals(13, selfChecked.get("evidence").get("finalizedAttempts").asInt());
        assertEquals(3, selfChecked.get("evidence").get("correctQuestions").asInt());
        assertEquals("CONSISTENT", selfChecked.get("assessmentStatus").asText());
        assertEquals(100.0, selfChecked.get("recentAccuracyPercent").asDouble(), 0.001);
    }

    @Test
    void understandingSamplesOnlyTenRecentQuestionsAndIgnoresUnsubmittedSessions() throws Exception {
        long first = 0L;
        for (int i = 0; i < 12; i++) {
            long questionId = insertPublishedQuestion("understanding-bound-" + i, "Question " + i, firstConceptId);
            if (i == 0) first = questionId;
            insertAttempt(questionId, "GRADED", i >= 2);
        }
        Timestamp at = Timestamp.valueOf("2026-09-04 00:00:00");
        long sessionId = jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at) VALUES (?, ?, ?) RETURNING id",
                Long.class, "IN_PROGRESS", "STANDARD", at);
        jdbc.update("""
                INSERT INTO attempt (quiz_session_id, question_id, grading_status, correct, graded_at)
                VALUES (?, ?, 'GRADED', false, ?)
                """, sessionId, first, at);

        JsonNode evidence = json(request("GET", "/api/concepts/" + firstConceptId + "/understanding", null));
        assertEquals(10, evidence.get("evidence").get("uniqueQuestions").asInt());
        assertEquals(12, evidence.get("evidence").get("finalizedAttempts").asInt());
        assertEquals(10, evidence.get("evidence").get("correctQuestions").asInt());
        assertEquals("CONSISTENT", evidence.get("assessmentStatus").asText());
    }


    @Test
    void areaUnderstandingHasStableTopicPagingAndMatchesConceptEvidence() throws Exception {
        long shared = insertPublishedQuestion("area-understanding-shared", "Shared question", firstConceptId, secondConceptId);
        long single = insertPublishedQuestion("area-understanding-first", "First-only question", firstConceptId);
        insertAttempt(shared, "GRADED", true);
        insertAttempt(single, "SELF_CHECK_REQUIRED", null);

        JsonNode first = json(request("GET",
                "/api/learning-areas/java/understanding?topicId=" + topicId + "&page=0&size=1", null));
        assertEquals(2, first.get("page").get("totalElements").asInt());
        assertEquals(2, first.get("page").get("totalPages").asInt());
        assertTrue(first.get("page").get("hasNext").asBoolean());
        JsonNode firstItem = first.get("items").get(0);
        assertEquals(firstConceptId, firstItem.get("conceptId").asLong());
        assertEquals(1, firstItem.get("evidence").get("uniqueQuestions").asInt());
        assertEquals(1, firstItem.get("evidence").get("finalizedAttempts").asInt());
        assertEquals(1, firstItem.get("evidence").get("pendingSelfCheckCount").asInt());
        assertTrue(firstItem.get("recentAccuracyPercent").isNull());

        JsonNode second = json(request("GET",
                "/api/learning-areas/java/understanding?topicId=" + topicId + "&page=1&size=1", null));
        assertFalse(second.get("page").get("hasNext").asBoolean());
        assertEquals(secondConceptId, second.get("items").get(0).get("conceptId").asLong());
        assertEquals(1, second.get("items").get(0).get("evidence").get("finalizedAttempts").asInt());
        JsonNode direct = json(request("GET", "/api/concepts/" + secondConceptId + "/understanding", null));
        assertEquals(direct.get("evidence"), second.get("items").get(0).get("evidence"));

        JsonNode empty = json(request("GET",
                "/api/learning-areas/java/understanding?topicId=" + topicId + "&page=2&size=1", null));
        assertEquals(0, empty.get("items").size());
        assertEquals(404, request("GET", "/api/learning-areas/missing/understanding", null).statusCode());
        assertEquals(400, request("GET", "/api/learning-areas/java/understanding?size=51", null).statusCode());
    }

    @Test
    void areaUnderstandingBatchDoesNotCountPendingAsFinalizedAcrossConcepts() throws Exception {
        long question = insertPublishedQuestion("area-understanding-multi", "Related", firstConceptId, secondConceptId);
        insertAttempt(question, "SELF_CHECK_REQUIRED", null);
        JsonNode area = json(request("GET", "/api/learning-areas/java/understanding?size=10", null));
        assertEquals(3, area.get("items").size());
        for (int index = 0; index < 2; index++) {
            JsonNode item = area.get("items").get(index);
            assertEquals(0, item.get("evidence").get("finalizedAttempts").asInt());
            assertEquals(1, item.get("evidence").get("pendingSelfCheckCount").asInt());
            assertEquals(0, item.get("evidence").get("uniqueQuestions").asInt());
            assertTrue(item.get("recentAccuracyPercent").isNull());
        }
        assertEquals(0, area.get("items").get(2).get("evidence").get("pendingSelfCheckCount").asInt());
    }


    @Test
    void areaUnderstandingQueryCountIsIndependentOfRequestedConceptCountAndExplainRuns() throws Exception {
        long q1 = insertPublishedQuestion("understanding-plan-one", "Plan one", firstConceptId);
        long q2 = insertPublishedQuestion("understanding-plan-two", "Plan two", firstConceptId, secondConceptId);
        insertAttempt(q1, "GRADED", true);
        insertAttempt(q2, "GRADED", false);

        Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        boolean previous = statistics.isStatisticsEnabled();
        statistics.setStatisticsEnabled(true);
        try {
            long beforeSmall = statistics.getPrepareStatementCount();
            assertEquals(200, request("GET", "/api/learning-areas/java/understanding?page=0&size=1", null).statusCode());
            long small = statistics.getPrepareStatementCount() - beforeSmall;

            long beforeFull = statistics.getPrepareStatementCount();
            assertEquals(200, request("GET", "/api/learning-areas/java/understanding?page=0&size=3", null).statusCode());
            long full = statistics.getPrepareStatementCount() - beforeFull;

            assertTrue(small <= 8, "Unexpected repeated database queries for one Concept: " + small);
            assertEquals(small, full, "Area batch evidence must not issue per-Concept queries");
        } finally {
            statistics.setStatisticsEnabled(previous);
        }

        String select = ConceptUnderstandingBatchRepository.class
                .getMethod("summarizeConceptIds", List.class)
                .getAnnotation(Query.class).value();
        List<String> plan = jdbc.queryForList(
                "EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) " + select.replace(":conceptIds", String.valueOf(firstConceptId)),
                String.class);
        assertFalse(plan.isEmpty());
        assertTrue(plan.stream().anyMatch(row -> row.contains("WindowAgg")),
                "The latest-attempt-per-question query should execute window aggregation");
    }

    @Test
    void bookmarkCategoryClassificationIsOptionalAndNeverChangesLearningHistory() throws Exception {
        JsonNode categories = json(request("GET", "/api/bookmark-categories", null));
        assertEquals(3, categories.size());
        assertEquals("다시 읽기", categories.get(0).get("name").asText());
        long first = categories.get(0).get("id").asLong();
        long second = categories.get(1).get("id").asLong();
        String assignmentPath = "/api/concepts/" + firstConceptId + "/bookmark-category";

        assertEquals(400, request("PUT", assignmentPath,
                "{\"categoryId\":" + first + "}").statusCode());
        assertEquals(200, request("PATCH", "/api/concepts/" + firstConceptId + "/progress",
                "{\"bookmarked\":true}").statusCode());
        assertEquals(200, request("PUT", assignmentPath, "{\"categoryId\":" + first + "}").statusCode());
        assertEquals(200, request("PUT", assignmentPath, "{\"categoryId\":" + first + "}").statusCode());
        assertEquals(first, json(request("GET", assignmentPath, null)).get("categoryId").asLong());
        assertEquals(1, json(request("GET",
                "/api/concepts?bookmarked=true&bookmarkCategoryId=" + first, null))
                .get("page").get("totalElements").asInt());

        assertEquals(200, request("PUT", assignmentPath, "{\"categoryId\":" + second + "}").statusCode());
        assertEquals(0, json(request("GET",
                "/api/concepts?bookmarkCategoryId=" + first, null))
                .get("page").get("totalElements").asInt());
        assertEquals(1, json(request("GET",
                "/api/concepts?bookmarkCategoryId=" + second, null))
                .get("page").get("totalElements").asInt());

        assertEquals(200, request("PUT", assignmentPath, "{\"categoryId\":null}").statusCode());
        assertTrue(json(request("GET", assignmentPath, null)).get("categoryId").isNull());
        assertEquals(1, json(request("GET", "/api/concepts?bookmarked=true", null))
                .get("page").get("totalElements").asInt());
        assertEquals(0, jdbc.queryForObject(
                "SELECT count(*) FROM bookmark_category_concept WHERE concept_id = ?", Integer.class, firstConceptId));

        request("PUT", assignmentPath, "{\"categoryId\":" + first + "}");
        assertEquals(200, request("PATCH", "/api/concepts/" + firstConceptId + "/progress",
                "{\"bookmarked\":false}").statusCode());
        assertTrue(json(request("GET", assignmentPath, null)).get("categoryId").isNull());
        assertEquals(0, json(request("GET", "/api/concepts?bookmarked=true", null))
                .get("page").get("totalElements").asInt());
        assertEquals(0, jdbc.queryForObject(
                "SELECT count(*) FROM bookmark_category_concept WHERE concept_id = ?", Integer.class, firstConceptId));
    }

    @Test
    void bookmarkCategoryRenameIsValidatedAndExistingBookmarkDoesNotDisappear() throws Exception {
        JsonNode categories = json(request("GET", "/api/bookmark-categories", null));
        long first = categories.get(0).get("id").asLong();
        String original = categories.get(0).get("name").asText();
        String secondName = categories.get(1).get("name").asText();
        String path = "/api/bookmark-categories/" + first;
        assertEquals(400, request("PATCH", path, "{\"name\":\"  \"}").statusCode());
        assertEquals(400, request("PATCH", path,
                "{\"name\":\"" + secondName + "\"}").statusCode());
        request("PATCH", "/api/concepts/" + firstConceptId + "/progress", "{\"bookmarked\":true}");
        assertEquals(404, request("PUT", "/api/concepts/" + firstConceptId + "/bookmark-category",
                "{\"categoryId\":987654}").statusCode());
        try {
            HttpResponse<String> response = request("PATCH", path, "{\"name\":\"나중에 복습\"}");
            assertEquals(200, response.statusCode());
            assertEquals("나중에 복습", json(response).get("name").asText());
            assertEquals("나중에 복습", json(request("GET", "/api/bookmark-categories", null))
                    .get(0).get("name").asText());
        } finally {
            request("PATCH", path, "{\"name\":\"" + original + "\"}");
        }
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

    private long insertPublishedQuestion(String contentKey, String prompt, long... conceptIds) {
        long questionId = jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status, explanation_markdown) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, contentKey, prompt, "MULTIPLE_CHOICE", "MEDIUM", "PUBLISHED", "Metrics explanation");
        jdbc.queryForObject(
                "INSERT INTO question_choice (question_id, choice_key, content_markdown, display_order) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, questionId, "A", "Distractor", 0);
        long correct = jdbc.queryForObject(
                "INSERT INTO question_choice (question_id, choice_key, content_markdown, display_order) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, questionId, "B", "Correct", 1);
        jdbc.update("INSERT INTO question_answer (question_id, answer_kind, choice_id, display_order) VALUES (?, ?, ?, ?)",
                questionId, "CORRECT_CHOICE", correct, 0);
        for (long conceptId : conceptIds) {
            jdbc.update("INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)", questionId, conceptId);
        }
        return questionId;
    }

    private long insertAttempt(long questionId, String gradingStatus, Boolean correct) {
        long choiceId = jdbc.queryForObject(
                "SELECT id FROM question_choice WHERE question_id = ? AND choice_key = 'A'", Long.class, questionId);
        Timestamp at = Timestamp.valueOf("2026-09-03 00:00:00");
        long sessionId = jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, completed_at) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, "COMPLETED", "STANDARD", at, at);
        return jdbc.queryForObject(
                "INSERT INTO attempt (quiz_session_id, question_id, selected_choice_id, review_needed, grading_status, correct, answered_at, graded_at, outcome_processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, sessionId, questionId, choiceId, false, gradingStatus, correct,
                at, correct == null ? null : at, correct == null ? null : at);
    }

    private long insertReference(String url, String title) {
        return jdbc.queryForObject(
                "INSERT INTO reference (url, title, reference_type, language_code, depth, recommendation) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, url, title, "OFFICIAL", "en", "BEGINNER", "Useful reference");
    }
}
