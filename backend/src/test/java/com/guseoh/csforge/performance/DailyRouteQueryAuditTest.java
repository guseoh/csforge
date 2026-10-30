package com.guseoh.csforge.performance;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 실제 HTTP daily route의 PostgreSQL 조회 수와 응답 크기를 격리된 데이터셋에서 측정한다. */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.jpa.properties.hibernate.generate_statistics=true",
                "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"
        })
@EnabledIfEnvironmentVariable(named = "CSFORGE_PERF_AUDIT", matches = "1")
class DailyRouteQueryAuditTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_daily_route_audit");

    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private static final String CREATE_QUIZ = "{\"areas\":[\"java\"],\"questionTypes\":[\"MULTIPLE_CHOICE\"],\"count\":10}";

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
        registry.add("spring.jpa.properties.hibernate.session_factory.statement_inspector", SqlInspector.class::getName);
    }

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    CanonicalBootstrapService bootstrapService;

    @Autowired
    EntityManagerFactory entityManagerFactory;

    @Value("${local.server.port}")
    int port;

    private List<Long> questionIds;
    private List<Long> conceptIds;
    private Map<Long, Long> wrongChoiceIds;
    private long resultQuizId;
    private long resumeQuizId;

    @Test
    void auditDailyRoutesWithCanonicalAndGrowingPersonalHistory() throws Exception {
        assertTrue(bootstrapService.bootstrap().success(), "canonical content bootstrap must succeed");
        prepareIds();
        List<AuditRow> rows = new ArrayList<>();
        List<String> repeatedSql = new ArrayList<>();

        seedHistory(0, 20);
        createResumeQuiz();
        measureRoutes("history20", rows, repeatedSql);

        seedHistory(20, 100);
        measureRoutes("history100", rows, repeatedSql);
        assertBoundedReads(rows);
        writeReport(rows, repeatedSql);
        writeSearchCountPlan();
    }

    private void assertBoundedReads(List<AuditRow> rows) {
        Map<String, Integer> limits = Map.of(
                "Concept detail", 7,
                "Quiz resume", 5,
                "Quiz result", 6,
                "Wrong note list", 5,
                "Wrong note list 50", 5,
                "Review list", 3,
                "Review list 50", 3);
        for (AuditRow row : rows) {
            Integer limit = limits.get(row.route());
            if (limit != null) {
                assertTrue(row.statements() <= limit && row.duplicateShapes() == 0,
                        row.scenario() + " / " + row.route() + " regressed to " + row.statements() + " statements");
            }
        }
    }

    private void prepareIds() {
        questionIds = new ArrayList<>(jdbc.queryForList("""
                select id from question
                where status = 'PUBLISHED' and question_type = 'MULTIPLE_CHOICE'
                order by id
                """, Long.class));
        conceptIds = new ArrayList<>(jdbc.queryForList("select id from concept where status = 'PUBLISHED' order by id", Long.class));
        Collections.shuffle(questionIds, new Random(156));
        Collections.shuffle(conceptIds, new Random(156));
        assertTrue(questionIds.size() >= 100 && conceptIds.size() >= 100);
        wrongChoiceIds = new LinkedHashMap<>();
        jdbc.query("""
                select choice.question_id, choice.id
                from question_choice choice
                where not exists (
                    select 1 from question_answer answer
                    where answer.choice_id = choice.id and answer.answer_kind = 'CORRECT_CHOICE'
                )
                order by choice.question_id, choice.display_order
                """, (result, row) -> new long[] {result.getLong(1), result.getLong(2)})
                .forEach(pair -> wrongChoiceIds.putIfAbsent(pair[0], pair[1]));
    }

    private void seedHistory(int from, int until) {
        Instant now = Instant.now();
        for (int first = from; first < until; first += 10) {
            Instant completedAt = now.minusSeconds(3_600L + first * 60L);
            long quizId = jdbc.queryForObject("""
                    insert into quiz_session (status, source, started_at, submitted_at, completed_at, last_position)
                    values ('COMPLETED', 'STANDARD', ?, ?, ?, 0) returning id
                    """, Long.class, Timestamp.from(completedAt.minusSeconds(600)), Timestamp.from(completedAt), Timestamp.from(completedAt));
            if (from == 0 && first == 0) resultQuizId = quizId;
            for (int index = first; index < first + 10; index++) {
                long questionId = questionIds.get(index);
                jdbc.update("insert into quiz_question (quiz_session_id, question_id, position) values (?, ?, ?)",
                        quizId, questionId, index - first);
                long attemptId = jdbc.queryForObject("""
                        insert into attempt (quiz_session_id, question_id, selected_choice_id, grading_status,
                                             correct, answered_at, graded_at, outcome_processed_at)
                        values (?, ?, ?, 'GRADED', false, ?, ?, ?) returning id
                        """, Long.class, quizId, questionId, wrongChoiceIds.get(questionId),
                        Timestamp.from(completedAt), Timestamp.from(completedAt), Timestamp.from(completedAt));
                jdbc.update("""
                        insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, last_wrong_attempt_id)
                        values (?, 'ACTIVE', 1, ?, ?, ?)
                        """, questionId, Timestamp.from(completedAt), Timestamp.from(completedAt), attemptId);
                jdbc.update("insert into review_schedule (question_id, status, stage, due_at) values (?, 'SCHEDULED', 1, ?)",
                        questionId, Timestamp.from(now.minusSeconds(3_600L + index * 60L)));
            }
        }
        for (int index = from; index < until; index++) {
            long conceptId = conceptIds.get(index);
            Instant viewedAt = now.minusSeconds(index * 1_800L);
            jdbc.update("""
                    insert into concept_progress (concept_id, status, first_viewed_at, last_viewed_at)
                    values (?, 'LEARNING', ?, ?)
                    """, conceptId, Timestamp.from(viewedAt), Timestamp.from(viewedAt));
            jdbc.update("insert into concept_view_history (concept_id, viewed_at) values (?, ?)",
                    conceptId, Timestamp.from(viewedAt));
            jdbc.update("insert into personal_note (concept_id, content) values (?, ?)",
                    conceptId, "cache learning note " + index);
        }
    }

    private void createResumeQuiz() {
        Instant startedAt = Instant.now();
        resumeQuizId = jdbc.queryForObject("""
                insert into quiz_session (status, source, started_at, last_position)
                values ('IN_PROGRESS', 'STANDARD', ?, 0) returning id
                """, Long.class, Timestamp.from(startedAt));
        for (int index = 0; index < 10; index++) {
            long questionId = questionIds.get(index);
            jdbc.update("insert into quiz_question (quiz_session_id, question_id, position) values (?, ?, ?)",
                    resumeQuizId, questionId, index);
            jdbc.update("insert into attempt (quiz_session_id, question_id) values (?, ?)", resumeQuizId, questionId);
        }
    }

    private void measureRoutes(String scenario, List<AuditRow> rows, List<String> repeatedSql) throws Exception {
        long conceptId = conceptIds.get(0);
        long questionId = questionIds.get(0);
        Map<String, Route> routes = new LinkedHashMap<>();
        routes.put("Dashboard", new Route("GET", "/api/dashboard", null));
        routes.put("Learning areas", new Route("GET", "/api/learning-areas", null));
        routes.put("Learning area detail", new Route("GET", "/api/learning-areas/java", null));
        routes.put("Concept list", new Route("GET", "/api/concepts?area=java&page=0&size=30", null));
        routes.put("Concept detail", new Route("GET", "/api/concepts/" + conceptId, null));
        routes.put("Search", new Route("GET", "/api/search?q=cache&page=0&size=20", null));
        routes.put("Quiz generation", new Route("POST", "/api/quizzes", CREATE_QUIZ));
        routes.put("Quiz resume", new Route("GET", "/api/quizzes/" + resumeQuizId, null));
        routes.put("Quiz result", new Route("GET", "/api/quizzes/" + resultQuizId + "/result", null));
        routes.put("Wrong note list", new Route("GET", "/api/wrong-notes?page=0&size=20", null));
        routes.put("Wrong note detail", new Route("GET", "/api/wrong-notes/" + questionId, null));
        routes.put("Review list", new Route("GET", "/api/reviews?page=0&size=20", null));
        if ("history100".equals(scenario)) {
            routes.put("Wrong note list 50", new Route("GET", "/api/wrong-notes?page=0&size=50", null));
            routes.put("Review list 50", new Route("GET", "/api/reviews?page=0&size=50", null));
        }
        for (Map.Entry<String, Route> entry : routes.entrySet()) {
            request(entry.getValue());
            List<Long> timings = new ArrayList<>();
            int statementCount = 0;
            int entityLoads = 0;
            int responseBytes = 0;
            Map<String, Long> duplicateQueries = Map.of();
            for (int repeat = 0; repeat < 3; repeat++) {
                SessionFactory factory = entityManagerFactory.unwrap(SessionFactory.class);
                factory.getStatistics().clear();
                SqlInspector.begin();
                long startedAt = System.nanoTime();
                HttpResponse<String> response;
                List<String> sql;
                try {
                    response = request(entry.getValue());
                } finally {
                    sql = SqlInspector.end();
                }
                timings.add((System.nanoTime() - startedAt) / 1_000_000);
                statementCount = sql.size();
                entityLoads = Math.toIntExact(factory.getStatistics().getEntityLoadCount());
                responseBytes = response.body().getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
                duplicateQueries = sql.stream().collect(Collectors.groupingBy(value -> value,
                        LinkedHashMap::new, Collectors.counting()));
            }
            timings.sort(Comparator.naturalOrder());
            long duplicates = duplicateQueries.values().stream().filter(count -> count > 1).count();
            rows.add(new AuditRow(scenario, entry.getKey(), statementCount, duplicates, entityLoads,
                    responseBytes, timings.get(1)));
            duplicateQueries.entrySet().stream().filter(item -> item.getValue() > 1).forEach(item -> repeatedSql.add(
                    scenario + " / " + entry.getKey() + " ×" + item.getValue() + ": " + item.getKey()));
        }
    }

    private HttpResponse<String> request(Route route) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + route.path()));
        if ("POST".equals(route.method())) {
            builder.header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(route.body()));
        } else {
            builder.GET();
        }
        HttpResponse<String> response = HTTP.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        assertTrue(response.statusCode() >= 200 && response.statusCode() < 300,
                route.path() + " returned " + response.statusCode() + ": " + response.body());
        return response;
    }

    private void writeReport(List<AuditRow> rows, List<String> repeatedSql) throws IOException {
        Path output = Path.of("build", "reports", "daily-route-query-audit.md");
        Files.createDirectories(output.getParent());
        StringBuilder text = new StringBuilder("# Daily route query audit\n\n")
                .append("PostgreSQL 16.4 Testcontainers; full canonical bootstrap; seeded 20 then 100 wrong notes, reviews, attempts, concept progress/views and personal notes. ")
                .append("Each route has one warm-up and three measured HTTP calls. SQL count is Hibernate StatementInspector count for the last call; ")
                .append("entity loads are Hibernate statistics for that call. Elapsed time is median HTTP wall time in milliseconds.\n\n")
                .append("| Dataset | Route | SQL | Repeated SQL shapes | Entities | Response bytes | HTTP p50 ms |\n")
                .append("| --- | --- | ---: | ---: | ---: | ---: | ---: |\n");
        for (AuditRow row : rows) {
            text.append("| ").append(row.scenario()).append(" | ").append(row.route()).append(" | ")
                    .append(row.statements()).append(" | ").append(row.duplicateShapes()).append(" | ")
                    .append(row.entityLoads()).append(" | ").append(row.responseBytes()).append(" | ")
                    .append(row.p50Ms()).append(" |\n");
        }
        text.append("\n## Repeated SQL\n\n");
        if (repeatedSql.isEmpty()) text.append("None.\n");
        else repeatedSql.forEach(sql -> text.append("- `").append(sql.replace("`", "'")).append("`\n"));
        Files.writeString(output, text.toString());
    }

    private void writeSearchCountPlan() throws IOException {
        List<String> plan = jdbc.query("""
                explain (analyze, buffers)
                select count(*) from search_document_view d
                where d.search_text ilike '%cache%'
                """, (result, row) -> result.getString(1));
        Path output = Path.of("build", "reports", "daily-route-search-count-plan.md");
        Files.writeString(output, "# Search count plan\n\n`q=cache`, canonical content and history100.\n\n```text\n"
                + String.join("\n", plan) + "\n```\n");
    }

    private record Route(String method, String path, String body) {
    }

    private record AuditRow(String scenario, String route, int statements, long duplicateShapes,
            int entityLoads, int responseBytes, long p50Ms) {
    }

    /** 측정 구간의 Hibernate SQL만 수집한다. */
    public static final class SqlInspector implements StatementInspector {
        private static final AtomicBoolean ACTIVE = new AtomicBoolean();
        private static final CopyOnWriteArrayList<String> SQL = new CopyOnWriteArrayList<>();

        public static void begin() {
            SQL.clear();
            ACTIVE.set(true);
        }

        public static List<String> end() {
            ACTIVE.set(false);
            return List.copyOf(SQL);
        }

        @Override
        public String inspect(String sql) {
            if (ACTIVE.get()) SQL.add(sql.replaceAll("\\s+", " ").trim());
            return sql;
        }
    }
}
