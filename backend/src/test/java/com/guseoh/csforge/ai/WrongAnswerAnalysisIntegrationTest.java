package com.guseoh.csforge.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import com.guseoh.csforge.ai.application.WrongAnswerAnalysisInputSnapshot;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisProcessor;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisProviderException;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisResult;
import com.guseoh.csforge.ai.application.WrongAnswerAnalyzer;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisRepository;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisStatus;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** V9 persistence, API idempotency, immutable snapshot과 DB-backed processor를 함께 검증한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(WrongAnswerAnalysisIntegrationTest.FakeAnalyzerConfiguration.class)
class WrongAnswerAnalysisIntegrationTest {

    private static final Instant BASE_TIME = Instant.parse("2026-09-03T00:00:00Z");
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_ai_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    WrongAnswerAnalysisRepository analysisRepository;

    @Autowired
    WrongAnswerAnalysisProcessor processor;

    @Autowired
    FakeAnalyzer analyzer;

    @Value("${local.server.port}")
    int port;

    private long questionId;
    private long conceptId;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.autoconfigure.exclude", () -> "org.springframework.boot.kafka.autoconfigure.KafkaAutoConfiguration");
        registry.add("spring.ai.model.chat", () -> "none");
        registry.add("csforge.ai.enabled", () -> "true");
        registry.add("csforge.ai.processor-delay-ms", () -> "60000");
        registry.add("csforge.ai.retry-initial-delay", () -> "0s");
    }

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
        jdbc.update("DELETE FROM concept_reference");
        jdbc.update("DELETE FROM concept_progress");
        jdbc.update("DELETE FROM concept");
        jdbc.update("DELETE FROM topic");

        long areaId = jdbc.queryForObject("SELECT id FROM learning_area WHERE slug = 'java'", Long.class);
        long topicId = jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order, active) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, areaId, "ai-topic", "ai-topic", "AI topic", 1, true);
        conceptId = jdbc.queryForObject(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, topicId, "ai-concept", "ai-concept", "AI concept", "AI concept body", 1, "PUBLISHED", 1);
        questionId = jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status, explanation_markdown) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, "ai-question", "Which answer?", "MULTIPLE_CHOICE", "MEDIUM", "PUBLISHED", "Canonical explanation");
        long choiceA = jdbc.queryForObject(
                "INSERT INTO question_choice (question_id, choice_key, content_markdown, display_order) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, questionId, "A", "Distractor", 0);
        long choiceB = jdbc.queryForObject(
                "INSERT INTO question_choice (question_id, choice_key, content_markdown, display_order) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, questionId, "B", "Correct answer", 1);
        jdbc.update("INSERT INTO question_answer (question_id, answer_kind, choice_id, display_order) VALUES (?, ?, ?, ?)",
                questionId, "CORRECT_CHOICE", choiceB, 0);
        jdbc.update("INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)", questionId, conceptId);
        long sessionId = jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, completed_at) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, "COMPLETED", "STANDARD", timestamp(BASE_TIME), timestamp(BASE_TIME.plusSeconds(30)));
        long attemptId = jdbc.queryForObject(
                "INSERT INTO attempt (quiz_session_id, question_id, selected_choice_id, review_needed, grading_status, correct, answered_at, graded_at, outcome_processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, sessionId, questionId, choiceA, false, "GRADED", false,
                timestamp(BASE_TIME.plusSeconds(10)), timestamp(BASE_TIME.plusSeconds(20)), timestamp(BASE_TIME.plusSeconds(25)));
        jdbc.update(
                "INSERT INTO wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) VALUES (?, ?, ?, ?, ?, ?)",
                questionId, "ACTIVE", 1, timestamp(BASE_TIME.plusSeconds(20)), timestamp(BASE_TIME.plusSeconds(20)), attemptId);
        analyzer.reset();
    }

    @Test
    void createsOneAnalysisWithRequestSnapshotAndCompletesIt() throws Exception {
        JsonNode notRequested = json(get("/api/wrong-notes/" + questionId + "/ai-analysis"));
        assertEquals("NOT_REQUESTED", notRequested.get("status").asText());

        HttpResponse<String> first = post("/api/wrong-notes/" + questionId + "/ai-analysis");
        assertEquals(202, first.statusCode());
        assertEquals("PENDING", json(first).get("status").asText());

        HttpResponse<String> duplicate = post("/api/wrong-notes/" + questionId + "/ai-analysis");
        assertEquals(200, duplicate.statusCode());
        assertEquals(1, analysisRepository.count());

        jdbc.update("UPDATE question SET prompt_markdown = ? WHERE id = ?", "Revised question", questionId);
        jdbc.update("UPDATE concept SET content_markdown = ? WHERE content_key = ?", "Revised concept", "ai-concept");
        processor.processDueWork();

        JsonNode completed = json(get("/api/wrong-notes/" + questionId + "/ai-analysis"));
        assertEquals("COMPLETED", completed.get("status").asText());
        assertEquals("ai-concept", completed.get("result").get("relatedConceptKeys").get(0).asText());
        assertEquals(conceptId, completed.get("result").get("relatedConcepts").get(0).get("id").asLong());
        assertNotNull(analyzer.snapshot.get());
        assertEquals("ai-question", analyzer.snapshot.get().question().contentKey());
        assertEquals("Which answer?", analyzer.snapshot.get().question().promptMarkdown());
        assertEquals(List.of("A", "B"), analyzer.snapshot.get().choices().stream()
                .map(WrongAnswerAnalysisInputSnapshot.ChoiceSnapshot::choiceKey).toList());
        assertEquals("A", analyzer.snapshot.get().userAnswer().selectedChoiceKey());
        assertEquals("B", analyzer.snapshot.get().canonicalAnswer().correctChoiceKey());
        assertEquals("AI concept body", analyzer.snapshot.get().relatedConcepts().get(0).contentMarkdown());
    }

    @Test
    void retryableProviderFailureReturnsToPendingThenCompletes() throws Exception {
        post("/api/wrong-notes/" + questionId + "/ai-analysis");
        analyzer.failNext.set(true);

        processor.processDueWork();
        assertEquals(WrongAnswerAnalysisStatus.PENDING, analysisRepository.findAll().get(0).getStatus());

        processor.processDueWork();
        assertEquals(WrongAnswerAnalysisStatus.COMPLETED, analysisRepository.findAll().get(0).getStatus());
    }

    @Test
    void concurrentRequestsStillCreateOneAnalysisRow() throws Exception {
        int requestCount = 6;
        ExecutorService executor = Executors.newFixedThreadPool(requestCount);
        CountDownLatch ready = new CountDownLatch(requestCount);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<Integer>> responses = java.util.stream.IntStream.range(0, requestCount)
                    .mapToObj(index -> executor.submit(() -> {
                        ready.countDown();
                        start.await();
                        return post("/api/wrong-notes/" + questionId + "/ai-analysis").statusCode();
                    }))
                    .toList();
            assertTrue(ready.await(10, java.util.concurrent.TimeUnit.SECONDS));
            start.countDown();
            for (Future<Integer> response : responses) assertTrue(response.get() == 200 || response.get() == 202);
            assertEquals(1, analysisRepository.count());
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void aLaterWrongAttemptGetsItsOwnCurrentAnalysis() throws Exception {
        post("/api/wrong-notes/" + questionId + "/ai-analysis");
        long firstAttemptId = analysisRepository.findAll().get(0).getAttempt().getId();
        long choiceId = jdbc.queryForObject(
                "SELECT id FROM question_choice WHERE question_id = ? AND choice_key = 'A'", Long.class, questionId);
        long sessionId = jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, completed_at) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, "COMPLETED", "STANDARD", timestamp(BASE_TIME.plusSeconds(60)), timestamp(BASE_TIME.plusSeconds(90)));
        long secondAttemptId = jdbc.queryForObject(
                "INSERT INTO attempt (quiz_session_id, question_id, selected_choice_id, review_needed, grading_status, correct, answered_at, graded_at, outcome_processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, sessionId, questionId, choiceId, false, "GRADED", false,
                timestamp(BASE_TIME.plusSeconds(70)), timestamp(BASE_TIME.plusSeconds(80)), timestamp(BASE_TIME.plusSeconds(85)));
        jdbc.update("UPDATE wrong_note SET last_wrong_attempt_id = ?, last_wrong_at = ? WHERE question_id = ?",
                secondAttemptId, timestamp(BASE_TIME.plusSeconds(80)), questionId);

        JsonNode current = json(get("/api/wrong-notes/" + questionId + "/ai-analysis"));
        assertEquals("NOT_REQUESTED", current.get("status").asText());
        assertEquals(secondAttemptId, current.get("attemptId").asLong());
        assertEquals(firstAttemptId, analysisRepository.findByAttemptId(firstAttemptId).orElseThrow().getAttempt().getId());
        assertEquals(202, post("/api/wrong-notes/" + questionId + "/ai-analysis").statusCode());
        assertEquals(2, analysisRepository.count());
    }

    @Test
    void wrongNoteListFiltersPersistedAnalysisStatusForCurrentAttempt() throws Exception {
        post("/api/wrong-notes/" + questionId + "/ai-analysis");
        long attemptId = analysisRepository.findAll().get(0).getAttempt().getId();

        assertEquals(1, list("PENDING").get("page").get("totalElements").asInt());
        jdbc.update("UPDATE wrong_answer_analysis SET status = 'PROCESSING' WHERE attempt_id = ?", attemptId);
        assertEquals(1, list("PROCESSING").get("page").get("totalElements").asInt());
        jdbc.update("UPDATE wrong_answer_analysis SET status = 'COMPLETED' WHERE attempt_id = ?", attemptId);
        assertEquals(1, list("COMPLETED").get("page").get("totalElements").asInt());
        jdbc.update("UPDATE wrong_answer_analysis SET status = 'FAILED' WHERE attempt_id = ?", attemptId);
        assertEquals(1, list("FAILED").get("page").get("totalElements").asInt());
        jdbc.update("DELETE FROM wrong_answer_analysis WHERE attempt_id = ?", attemptId);
        assertEquals(1, list("NOT_REQUESTED").get("page").get("totalElements").asInt());
    }

    @Test
    void wrongNoteListUsesCurrentAttemptWhenAnOlderAnalysisExists() throws Exception {
        post("/api/wrong-notes/" + questionId + "/ai-analysis");
        long firstAttemptId = analysisRepository.findAll().get(0).getAttempt().getId();
        long secondAttemptId = insertLaterWrongAttempt();
        jdbc.update("UPDATE wrong_answer_analysis SET status = 'COMPLETED' WHERE attempt_id = ?", firstAttemptId);

        JsonNode item = list("ALL").get("items").get(0);
        assertEquals("NOT_REQUESTED", item.get("aiAnalysisStatus").asText());
        assertEquals(1, list("NOT_REQUESTED").get("page").get("totalElements").asInt());
        assertEquals(0, list("COMPLETED").get("page").get("totalElements").asInt());
        assertTrue(secondAttemptId > firstAttemptId);
    }

    @Test
    void wrongNoteListUsesFailedStatusFromCurrentAttemptInsteadOfOlderCompletedAnalysis() throws Exception {
        post("/api/wrong-notes/" + questionId + "/ai-analysis");
        long firstAttemptId = analysisRepository.findAll().get(0).getAttempt().getId();
        jdbc.update("UPDATE wrong_answer_analysis SET status = 'COMPLETED' WHERE attempt_id = ?", firstAttemptId);
        long secondAttemptId = insertLaterWrongAttempt();
        assertEquals(202, post("/api/wrong-notes/" + questionId + "/ai-analysis").statusCode());
        jdbc.update("UPDATE wrong_answer_analysis SET status = 'FAILED' WHERE attempt_id = ?", secondAttemptId);

        JsonNode item = list("ALL").get("items").get(0);
        assertEquals("FAILED", item.get("aiAnalysisStatus").asText());
        assertEquals(1, list("FAILED").get("page").get("totalElements").asInt());
        assertEquals(0, list("COMPLETED").get("page").get("totalElements").asInt());
    }

    @Test
    void wrongNoteListEnrichesMultipleRowsWithOneCurrentStatusEach() throws Exception {
        long secondQuestionId = insertSecondWrongNote();
        post("/api/wrong-notes/" + questionId + "/ai-analysis");
        post("/api/wrong-notes/" + secondQuestionId + "/ai-analysis");
        List<JsonNode> items = java.util.stream.StreamSupport.stream(list("ALL").get("items").spliterator(), false).toList();

        assertEquals(2, items.size());
        assertTrue(items.stream().allMatch(item -> item.get("aiAnalysisStatus").asText().equals("PENDING")));
        assertEquals(2, list("PENDING").get("page").get("totalElements").asInt());
    }

    private JsonNode list(String analysis) throws IOException, InterruptedException {
        return json(get("/api/wrong-notes?page=0&size=20&analysis=" + analysis));
    }

    private long insertLaterWrongAttempt() {
        long choiceId = jdbc.queryForObject(
                "SELECT id FROM question_choice WHERE question_id = ? AND choice_key = 'A'", Long.class, questionId);
        long sessionId = jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, completed_at) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, "COMPLETED", "STANDARD", timestamp(BASE_TIME.plusSeconds(60)), timestamp(BASE_TIME.plusSeconds(90)));
        long attemptId = jdbc.queryForObject(
                "INSERT INTO attempt (quiz_session_id, question_id, selected_choice_id, review_needed, grading_status, correct, answered_at, graded_at, outcome_processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, sessionId, questionId, choiceId, false, "GRADED", false,
                timestamp(BASE_TIME.plusSeconds(70)), timestamp(BASE_TIME.plusSeconds(80)), timestamp(BASE_TIME.plusSeconds(85)));
        jdbc.update("UPDATE wrong_note SET last_wrong_attempt_id = ?, last_wrong_at = ? WHERE question_id = ?",
                attemptId, timestamp(BASE_TIME.plusSeconds(80)), questionId);
        return attemptId;
    }

    private long insertSecondWrongNote() {
        long secondQuestionId = jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status, explanation_markdown) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, "ai-question-2", "Which second answer?", "MULTIPLE_CHOICE", "EASY", "PUBLISHED", "Second explanation");
        long choiceA = jdbc.queryForObject(
                "INSERT INTO question_choice (question_id, choice_key, content_markdown, display_order) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, secondQuestionId, "A", "Second distractor", 0);
        long choiceB = jdbc.queryForObject(
                "INSERT INTO question_choice (question_id, choice_key, content_markdown, display_order) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, secondQuestionId, "B", "Second correct", 1);
        jdbc.update("INSERT INTO question_answer (question_id, answer_kind, choice_id, display_order) VALUES (?, ?, ?, ?)",
                secondQuestionId, "CORRECT_CHOICE", choiceB, 0);
        jdbc.update("INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)", secondQuestionId, conceptId);
        long sessionId = jdbc.queryForObject(
                "INSERT INTO quiz_session (status, source, started_at, completed_at) VALUES (?, ?, ?, ?) RETURNING id",
                Long.class, "COMPLETED", "STANDARD", timestamp(BASE_TIME.plusSeconds(120)), timestamp(BASE_TIME.plusSeconds(150)));
        long attemptId = jdbc.queryForObject(
                "INSERT INTO attempt (quiz_session_id, question_id, selected_choice_id, review_needed, grading_status, correct, answered_at, graded_at, outcome_processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, sessionId, secondQuestionId, choiceA, false, "GRADED", false,
                timestamp(BASE_TIME.plusSeconds(130)), timestamp(BASE_TIME.plusSeconds(140)), timestamp(BASE_TIME.plusSeconds(145)));
        jdbc.update(
                "INSERT INTO wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id) VALUES (?, ?, ?, ?, ?, ?)",
                secondQuestionId, "ACTIVE", 1, timestamp(BASE_TIME.plusSeconds(140)), timestamp(BASE_TIME.plusSeconds(140)), attemptId);
        return secondQuestionId;
    }

    private HttpResponse<String> get(String path) throws IOException, InterruptedException {
        return HTTP_CLIENT.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json").GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(String path) throws IOException, InterruptedException {
        return HTTP_CLIENT.send(HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json").POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode json(HttpResponse<String> response) throws IOException {
        return objectMapper.readTree(response.body());
    }

    private static Timestamp timestamp(Instant value) {
        return Timestamp.from(value);
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class FakeAnalyzerConfiguration {

        @Bean
        @Primary
        FakeAnalyzer fakeAnalyzer() {
            return new FakeAnalyzer();
        }
    }

    static class FakeAnalyzer implements WrongAnswerAnalyzer {

        private final AtomicReference<WrongAnswerAnalysisInputSnapshot> snapshot = new AtomicReference<>();
        private final AtomicInteger calls = new AtomicInteger();
        private final java.util.concurrent.atomic.AtomicBoolean failNext = new java.util.concurrent.atomic.AtomicBoolean();

        @Override
        public WrongAnswerAnalysisResult analyze(WrongAnswerAnalysisInputSnapshot snapshot) {
            this.snapshot.set(snapshot);
            calls.incrementAndGet();
            if (failNext.compareAndSet(true, false)) {
                throw new WrongAnswerAnalysisProviderException(
                        "AI_PROVIDER_UNAVAILABLE", "provider unavailable", true);
            }
            return new WrongAnswerAnalysisResult(
                    "The distractor was selected.",
                    List.of("transactions"),
                    "Use the canonical transaction model.",
                    List.of("ai-concept"),
                    List.of("How would you explain atomicity?"));
        }

        void reset() {
            snapshot.set(null);
            calls.set(0);
            failNext.set(false);
        }
    }
}
