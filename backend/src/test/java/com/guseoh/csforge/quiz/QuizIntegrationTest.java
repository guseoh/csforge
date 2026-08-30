package com.guseoh.csforge.quiz;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.question.domain.QuestionType;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(QuizIntegrationTest.FixedClockConfiguration.class)
class QuizIntegrationTest {

    private static final Instant BASE_TIME = Instant.parse("2026-08-30T00:00:00Z");
    private static final MutableClock TEST_CLOCK = new MutableClock(BASE_TIME);

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

    @Autowired
    ConceptRepository conceptRepository;

    @Autowired
    QuestionRepository questionRepository;

    @Value("${local.server.port}")
    int port;

    private long conceptId;
    private long multipleChoiceId;
    private long shortAnswerId;
    private long descriptiveId;
    private long scenarioId;

    @BeforeEach
    void setUpFixture() {
        TEST_CLOCK.set(BASE_TIME);
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
        jdbc.update("DELETE FROM topic");

        long areaId = jdbc.queryForObject("SELECT id FROM learning_area WHERE slug = 'java'", Long.class);
        long topicId = jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order) VALUES (?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                areaId,
                "quiz-topic",
                "quiz-topic",
                "Quiz topic",
                1);
        conceptId = insertConcept(topicId, "quiz-concept", "quiz-concept", "Quiz concept", 1);
        Concept concept = conceptRepository.getReferenceById(conceptId);
        multipleChoiceId = saveMultipleChoice(concept);
        shortAnswerId = saveShortAnswer(concept);
        descriptiveId = saveSelfCheckQuestion(
                concept,
                QuestionType.DESCRIPTIVE,
                "Describe transactions",
                "A transaction groups work atomically.");
        scenarioId = saveSelfCheckQuestion(
                concept,
                QuestionType.SCENARIO,
                "Design a retry",
                "Use bounded retries and idempotency.");
        jdbc.update(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status) VALUES (?, ?, ?, ?, ?)",
                "draft-question",
                "Draft",
                "SHORT_ANSWER",
                "EASY",
                "DRAFT");
    }

    @Test
    void availabilityFiltersPublishedLinkedQuestionsAndCreationUsesStableOrderWithoutLeakage() throws Exception {
        JsonNode availability = json(request(
                "GET",
                "/api/quizzes/availability?area=java&concept=" + conceptId + "&level=1&difficulty=EASY&state=ALL",
                null));
        assertEquals(1, availability.get("availableCount").asInt());

        HttpResponse<String> created = request("POST", "/api/quizzes", """
                {"areas":["java"],"concepts":[%d],"levels":[1],"difficulties":[],"questionTypes":[],"state":"ALL","count":4,"timeLimitSeconds":600}
                """.formatted(conceptId));
        assertEquals(201, created.statusCode());
        long quizId = json(created).get("quizId").asLong();

        HttpResponse<String> sessionResponse = request("GET", "/api/quizzes/" + quizId, null);
        assertEquals(200, sessionResponse.statusCode());
        JsonNode session = json(sessionResponse);
        assertEquals(4, session.get("questions").size());
        assertEquals(multipleChoiceId, session.get("questions").get(0).get("questionId").asLong());
        assertEquals(shortAnswerId, session.get("questions").get(1).get("questionId").asLong());
        assertTrue(session.get("questions").get(0).get("choices").size() >= 2);
        assertFalse(session.toString().contains("correctChoiceKey"));
        assertFalse(session.toString().contains("acceptedAnswers"));
        assertFalse(session.toString().contains("modelAnswer"));
        assertFalse(session.toString().contains("\"correct\""));

        assertEquals(0, json(request(
                "GET",
                "/api/quizzes/availability?area=java&concept=" + conceptId + "&state=UNSEEN",
                null)).get("availableCount").asInt());
        assertEquals(422, request("POST", "/api/quizzes", """
                {"areas":["java"],"concepts":[%d],"levels":[],"difficulties":[],"questionTypes":[],"state":"ALL","count":50,"timeLimitSeconds":null}
                """.formatted(conceptId)).statusCode());
    }

    @Test
    void autosaveResumeRejectsIncompatibleAnswersAndBoundsPosition() throws Exception {
        long quizId = createQuiz(4, null);
        HttpResponse<String> savedChoice = request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + multipleChoiceId + "/answer",
                "{\"selectedChoiceKey\":\"A\",\"answerText\":null,\"reviewNeeded\":true}");
        assertEquals(200, savedChoice.statusCode());
        assertEquals("A", json(savedChoice).get("selectedChoiceKey").asText());

        JsonNode resumed = json(request("GET", "/api/quizzes/" + quizId, null));
        assertEquals("A", resumed.get("questions").get(0).get("answer").get("selectedChoiceKey").asText());
        assertTrue(resumed.get("questions").get(0).get("answer").get("reviewNeeded").asBoolean());
        assertFalse(resumed.toString().contains("correctChoiceKey"));

        assertEquals(400, request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + multipleChoiceId + "/answer",
                "{\"selectedChoiceKey\":null,\"answerText\":\"not compatible\",\"reviewNeeded\":false}").statusCode());
        assertEquals(200, request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + shortAnswerId + "/answer",
                "{\"selectedChoiceKey\":null,\"answerText\":\"Spring\",\"reviewNeeded\":false}").statusCode());
        assertEquals(204, request(
                "PATCH",
                "/api/quizzes/" + quizId + "/position",
                "{\"position\":2}").statusCode());
        assertEquals(400, request(
                "PATCH",
                "/api/quizzes/" + quizId + "/position",
                "{\"position\":99}").statusCode());
    }

    @Test
    void submitGradesAutomaticallyRequiresSelfCheckAndSupportsWrongRetry() throws Exception {
        long quizId = createQuiz(4, null);
        request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + multipleChoiceId + "/answer",
                "{\"selectedChoiceKey\":\"B\",\"answerText\":null,\"reviewNeeded\":false}");
        request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + shortAnswerId + "/answer",
                "{\"selectedChoiceKey\":null,\"answerText\":\"spring\",\"reviewNeeded\":false}");
        request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + descriptiveId + "/answer",
                "{\"selectedChoiceKey\":null,\"answerText\":\"transaction answer\",\"reviewNeeded\":false}");

        JsonNode submission = json(request("POST", "/api/quizzes/" + quizId + "/submit", null));
        assertEquals("SUBMITTED", submission.get("status").asText());
        assertEquals(1, submission.get("selfCheckPendingCount").asInt());
        JsonNode duplicate = json(request("POST", "/api/quizzes/" + quizId + "/submit", null));
        assertEquals(submission.get("submittedAt").asText(), duplicate.get("submittedAt").asText());

        JsonNode result = json(request("GET", "/api/quizzes/" + quizId + "/result", null));
        assertEquals(1, result.get("correct").asInt());
        assertEquals(1, result.get("wrong").asInt());
        assertEquals(1, result.get("unanswered").asInt());
        assertEquals(1, result.get("selfCheckPending").asInt());
        assertEquals("A", result.get("questions").get(0).get("correctChoiceKey").asText());
        assertFalse(result.get("questions").get(2).get("modelAnswer").isNull());
        assertEquals(409, request("POST", "/api/quizzes/" + quizId + "/retry-wrong", null).statusCode());

        JsonNode checked = json(request(
                "PATCH",
                "/api/quizzes/" + quizId + "/questions/" + descriptiveId + "/self-check",
                "{\"correct\":true}"));
        assertTrue(checked.get("correct").asBoolean());
        assertEquals("COMPLETED", checked.get("sessionStatus").asText());
        JsonNode retry = json(request("POST", "/api/quizzes/" + quizId + "/retry-wrong", null));
        assertNotNull(retry.get("quizId"));
        assertEquals(2, retry.get("questionCount").asInt());
        assertEquals("IN_PROGRESS", retry.get("status").asText());
    }

    @Test
    void injectedClockBlocksExpiredAutosaveButAllowsSubmission() throws Exception {
        long quizId = createQuiz(1, 60);
        TEST_CLOCK.set(BASE_TIME.plusSeconds(61));
        assertEquals(409, request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + multipleChoiceId + "/answer",
                "{\"selectedChoiceKey\":\"A\",\"answerText\":null,\"reviewNeeded\":false}").statusCode());
        JsonNode submission = json(request("POST", "/api/quizzes/" + quizId + "/submit", null));
        assertEquals("COMPLETED", submission.get("status").asText());
        JsonNode session = json(request("GET", "/api/quizzes/" + quizId, null));
        assertTrue(session.get("expired").asBoolean());
    }

    @Test
    void retryWithoutFinalizedWrongQuestionsReturnsARecoverableDomainError() throws Exception {
        long quizId = createQuiz(1, null);
        assertEquals(200, request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + multipleChoiceId + "/answer",
                "{\"selectedChoiceKey\":\"A\",\"answerText\":null,\"reviewNeeded\":false}").statusCode());
        JsonNode submission = json(request("POST", "/api/quizzes/" + quizId + "/submit", null));
        assertEquals("COMPLETED", submission.get("status").asText());
        assertEquals(422, request("POST", "/api/quizzes/" + quizId + "/retry-wrong", null).statusCode());
    }

    @Test
    void resultBreakdownCountsEveryDistinctRelatedTopic() throws Exception {
        long javaAreaId = jdbc.queryForObject("SELECT id FROM learning_area WHERE slug = 'java'", Long.class);
        long secondTopicId = jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order) VALUES (?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                javaAreaId,
                "quiz-topic-two",
                "quiz-topic-two",
                "Quiz topic two",
                2);
        long secondConceptId = insertConcept(
                secondTopicId,
                "quiz-concept-two",
                "quiz-concept-two",
                "Quiz concept two",
                1);
        jdbc.update(
                "INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)",
                multipleChoiceId,
                secondConceptId);

        long quizId = createQuiz(1, null);
        request(
                "PUT",
                "/api/quizzes/" + quizId + "/questions/" + multipleChoiceId + "/answer",
                "{\"selectedChoiceKey\":\"A\",\"answerText\":null,\"reviewNeeded\":false}");
        request("POST", "/api/quizzes/" + quizId + "/submit", null);

        JsonNode result = json(request("GET", "/api/quizzes/" + quizId + "/result", null));
        assertEquals(2, result.get("breakdown").size());
    }

    @Test
    void schemaConstraintsProtectQuizQuestionUniquenessAndNormalizedAcceptedAnswers() throws Exception {
        long quizId = createQuiz(1, null);
        assertTrue(jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'question_published_selection_idx'",
                Integer.class) > 0);
        assertTrue(jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'attempt_question_answered_idx'",
                Integer.class) > 0);
        assertEquals(1, jdbc.queryForObject(
                "SELECT COUNT(*) FROM quiz_question WHERE quiz_session_id = ?",
                Integer.class,
                quizId));
        assertThrowsIntegrity(() -> jdbc.update(
                "INSERT INTO quiz_question (quiz_session_id, question_id, position) VALUES (?, ?, ?)",
                quizId,
                multipleChoiceId,
                0));
        assertThrowsIntegrity(() -> jdbc.update(
                "INSERT INTO question_answer (question_id, answer_kind, answer_text, display_order) VALUES (?, 'ACCEPTED_TEXT', ?, ?)",
                shortAnswerId,
                " Spring ",
                99));
    }

    private long createQuiz(int count, Integer timeLimitSeconds) throws Exception {
        String time = timeLimitSeconds == null ? "null" : timeLimitSeconds.toString();
        HttpResponse<String> response = request("POST", "/api/quizzes", """
                {"areas":["java"],"concepts":[%d],"levels":[],"difficulties":[],"questionTypes":[],"state":"ALL","count":%d,"timeLimitSeconds":%s}
                """.formatted(conceptId, count, time));
        assertEquals(201, response.statusCode(), response.body());
        return json(response).get("quizId").asLong();
    }

    private long saveMultipleChoice(Concept concept) {
        Question question = Question.createDraft(
                "mcq-question",
                "Which answer is correct?",
                QuestionType.MULTIPLE_CHOICE,
                QuestionDifficulty.EASY,
                "Choose A.");
        var first = question.addChoice("A", "A", 0);
        question.addChoice("B", "B", 1);
        question.defineCorrectChoice(first);
        question.linkConcept(concept);
        question.publish();
        return questionRepository.saveAndFlush(question).getId();
    }

    private long saveShortAnswer(Concept concept) {
        Question question = Question.createDraft(
                "short-question",
                "Name the framework.",
                QuestionType.SHORT_ANSWER,
                QuestionDifficulty.MEDIUM,
                "Spring is accepted.");
        question.addAcceptedAnswer("spring");
        question.addAcceptedAnswer("Spring Boot");
        question.linkConcept(concept);
        question.publish();
        return questionRepository.saveAndFlush(question).getId();
    }

    private long saveSelfCheckQuestion(Concept concept, QuestionType type, String prompt, String modelAnswer) {
        Question question = Question.createDraft(
                type == QuestionType.DESCRIPTIVE ? "descriptive-question" : "scenario-question",
                prompt,
                type,
                QuestionDifficulty.HARD,
                "Compare with the model.");
        question.defineModelAnswer(modelAnswer);
        question.linkConcept(concept);
        question.publish();
        return questionRepository.saveAndFlush(question).getId();
    }

    private long insertConcept(long topicId, String contentKey, String slug, String title, int level) {
        return jdbc.queryForObject(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                topicId,
                contentKey,
                slug,
                title,
                "# Quiz concept",
                level,
                "PUBLISHED",
                1);
    }

    private HttpResponse<String> request(String method, String path, String body)
            throws IOException, InterruptedException {
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

    private void assertThrowsIntegrity(ThrowingRunnable action) {
        try {
            action.run();
        } catch (DataIntegrityViolationException expected) {
            return;
        } catch (Exception exception) {
            throw new AssertionError(exception);
        }
        throw new AssertionError("Expected a database integrity violation");
    }

    @FunctionalInterface
    private interface ThrowingRunnable {
        void run() throws Exception;
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {
        @Bean
        @Primary
        Clock testClock() {
            return TEST_CLOCK;
        }
    }

    static final class MutableClock extends Clock {
        private Instant instant;

        MutableClock(Instant instant) {
            this.instant = instant;
        }

        void set(Instant instant) {
            this.instant = instant;
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }
    }
}
