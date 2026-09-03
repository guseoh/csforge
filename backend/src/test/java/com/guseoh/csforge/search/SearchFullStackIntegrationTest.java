package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import com.guseoh.csforge.search.application.SearchIndexListenerControl;
import com.guseoh.csforge.search.application.SearchReindexIndexStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.images.builder.ImageFromDockerfile;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.kafka.KafkaContainer;
import org.testcontainers.utility.DockerImageName;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** PostgreSQL, Kafka, Nori Elasticsearch를 함께 띄워 full reindex와 incremental indexing을 검증한다. */
@Testcontainers
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.autoconfigure.exclude=",
                "csforge.search.outbox.relay.enabled=true",
                "csforge.search.outbox-relay-delay-ms=100",
                "spring.kafka.consumer.auto-offset-reset=earliest"
        })
class SearchFullStackIntegrationTest {

    private static final HttpClient HTTP = HttpClient.newHttpClient();
    private static final ImageFromDockerfile ELASTICSEARCH_IMAGE = new ImageFromDockerfile(
            "csforge-search-integration-es",
            false)
            .withDockerfileFromBuilder(builder -> builder
                    .from("docker.elastic.co/elasticsearch/elasticsearch:9.4.5")
                    .run("elasticsearch-plugin install --batch analysis-nori")
                    .build());

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_search_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @Container
    static final KafkaContainer KAFKA = new KafkaContainer(DockerImageName.parse("apache/kafka:4.0.0"));

    @Container
    static final GenericContainer<?> ELASTICSEARCH = new GenericContainer<>(ELASTICSEARCH_IMAGE)
            .withExposedPorts(9200)
            .withEnv("discovery.type", "single-node")
            .withEnv("xpack.security.enabled", "false")
            .withEnv("xpack.security.enrollment.enabled", "false")
            .withEnv("ES_JAVA_OPTS", "-Xms384m -Xmx384m")
            .waitingFor(Wait.forHttp("/_cluster/health")
                    .forPort(9200)
                    .forStatusCode(200)
                    .withStartupTimeout(Duration.ofMinutes(4)));

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    SearchIndexListenerControl listenerControl;

    @MockitoSpyBean
    SearchReindexIndexStore reindexIndexStore;

    @Value("${local.server.port}")
    int port;

    @DynamicPropertySource
    static void infrastructure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.kafka.bootstrap-servers", KAFKA::getBootstrapServers);
        registry.add("spring.elasticsearch.uris", SearchFullStackIntegrationTest::elasticsearchUrl);
    }

    @BeforeEach
    void cleanSearchFixture() throws Exception {
        listenerControl.resume();
        jdbc.update("delete from search_outbox_event");
        jdbc.update("delete from wrong_note where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question_answer where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question_choice where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question_concept where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question where content_key like 'search.it.%'");
        jdbc.update("delete from personal_note");
        jdbc.update("delete from concept_reference");
        jdbc.update("delete from reference where url like 'https://search.it/%'");
        jdbc.update("delete from concept");
        jdbc.update("delete from topic where content_key like 'search.it.%'");
        deleteSearchIndices();
    }

    @Test
    void fullReindexThenPersonalNoteChangeConvergesThroughKafka() throws Exception {
        long conceptId = insertPublishedConcept();

        HttpResponse<String> reindex = request("POST", "/api/search/reindex", null);
        assertEquals(200, reindex.statusCode(), reindex.body());
        JsonNode reindexBody = objectMapper.readTree(reindex.body());
        assertEquals(1, reindexBody.get("totalIndexedCount").asLong());
        assertEquals(1, reindexBody.get("indexedCounts").get("CONCEPT").asLong());
        assertEquals(200, elasticsearchGet("/_alias/csforge-search").statusCode());

        JsonNode conceptSearch = search("AtomicReindexMarker");
        assertEquals(1, conceptSearch.get("totalHits").asLong(), conceptSearch.toString());
        assertEquals("CONCEPT", conceptSearch.get("items").get(0).get("documentType").asText());

        HttpResponse<String> noteWrite = request(
                "PUT",
                "/api/concepts/" + conceptId + "/note",
                "{\"content\":\"PersonalKafkaMarker\"}");
        assertEquals(200, noteWrite.statusCode(), noteWrite.body());

        JsonNode noteSearch = awaitSearchHit("PersonalKafkaMarker", Duration.ofSeconds(20));
        assertEquals(1, noteSearch.get("totalHits").asLong(), noteSearch.toString());
        assertEquals("PERSONAL_NOTE", noteSearch.get("items").get(0).get("documentType").asText());
        assertEquals(0, jdbc.queryForObject(
                "select count(*) from search_outbox_event where published_at is null",
                Integer.class));
    }

    @Test
    void fullReindexIndexesAllDocumentTypesAndSupportsNoriAndTechnicalIdentifiers() throws Exception {
        insertCompleteSearchFixture();

        HttpResponse<String> reindex = request("POST", "/api/search/reindex", null);
        assertEquals(200, reindex.statusCode(), reindex.body());
        JsonNode body = objectMapper.readTree(reindex.body());
        assertEquals(5, body.get("totalIndexedCount").asLong(), body.toString());
        assertEquals(1, body.get("indexedCounts").get("CONCEPT").asLong());
        assertEquals(1, body.get("indexedCounts").get("QUESTION").asLong());
        assertEquals(1, body.get("indexedCounts").get("PERSONAL_NOTE").asLong());
        assertEquals(1, body.get("indexedCounts").get("WRONG_NOTE").asLong());
        assertEquals(1, body.get("indexedCounts").get("REFERENCE").asLong());

        assertSearchContainsType("객체", "CONCEPT");
        assertSearchContainsType("HashMap", "CONCEPT");
        assertSearchContainsType("ThreadLocal", "PERSONAL_NOTE");
        assertSearchContainsType("HTTP/2", "QUESTION");
        assertSearchContainsType("fsync", "WRONG_NOTE");
        assertSearchContainsType("ReferenceOnlyMarker", "REFERENCE");
    }

    @Test
    void fullReindexCatchesProjectionCreatedAfterBaselineBeforeAliasSwap() throws Exception {
        long conceptId = insertPublishedConcept();
        long baselineSequence = jdbc.queryForObject(
                "select coalesce(max(change_sequence), 0) from search_outbox_event",
                Long.class);
        CountDownLatch firstBulkReached = new CountDownLatch(1);
        CountDownLatch releaseFirstBulk = new CountDownLatch(1);
        AtomicBoolean blockFirstBulk = new AtomicBoolean(true);
        boolean listenerPaused = listenerControl.pauseAndAwait();

        doAnswer(invocation -> {
            if (blockFirstBulk.compareAndSet(true, false)) {
                firstBulkReached.countDown();
                if (!releaseFirstBulk.await(20, TimeUnit.SECONDS)) {
                    throw new AssertionError("Timed out waiting to release first reindex bulk");
                }
            }
            return invocation.callRealMethod();
        }).when(reindexIndexStore).bulkUpsert(anyString(), anyList());

        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            Future<HttpResponse<String>> reindexFuture = executor.submit(
                    () -> request("POST", "/api/search/reindex", null));
            assertTrue(firstBulkReached.await(30, TimeUnit.SECONDS), "Full reindex did not reach first bulk");

            HttpResponse<String> noteWrite = request(
                    "PUT",
                    "/api/concepts/" + conceptId + "/note",
                    "{\"content\":\"HighWaterCatchUpMarker\"}");
            assertEquals(200, noteWrite.statusCode(), noteWrite.body());
            long noteId = jdbc.queryForObject(
                    "select id from personal_note where concept_id = ?",
                    Long.class,
                    conceptId);
            long noteChangeSequence = jdbc.queryForObject(
                    """
                    select change_sequence
                    from search_outbox_event
                    where change_type = 'PERSONAL_NOTE' and source_id = ?
                    order by change_sequence desc
                    limit 1
                    """,
                    Long.class,
                    noteId);
            assertTrue(noteChangeSequence > baselineSequence);

            releaseFirstBulk.countDown();
            HttpResponse<String> reindex = reindexFuture.get(40, TimeUnit.SECONDS);
            assertEquals(200, reindex.statusCode(), reindex.body());

            JsonNode caughtUpSearch = search("HighWaterCatchUpMarker");
            assertEquals(1, caughtUpSearch.get("totalHits").asLong(), caughtUpSearch.toString());
            assertEquals("PERSONAL_NOTE", caughtUpSearch.get("items").get(0).get("documentType").asText());
        } finally {
            releaseFirstBulk.countDown();
            executor.shutdownNow();
            if (listenerPaused) listenerControl.resume();
        }
    }

    private long insertPublishedConcept() {
        long areaId = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long topicId = jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order, active)
                values (?, 'search.it.topic', 'search-it-topic', 'Search integration topic', 999, true)
                returning id
                """, Long.class, areaId);
        return jdbc.queryForObject("""
                insert into concept (
                    topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order)
                values (?, 'search.it.concept', 'search-it-concept', 'AtomicReindexMarker',
                        'Search integration summary', '# AtomicReindexMarker body', 1, 'PUBLISHED', 999)
                returning id
                """, Long.class, topicId);
    }

    private void insertCompleteSearchFixture() {
        long areaId = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long topicId = jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order, active)
                values (?, 'search.it.all-types-topic', 'search-it-all-types-topic', '검색 분석기 통합 주제', 998, true)
                returning id
                """, Long.class, areaId);
        long conceptId = jdbc.queryForObject("""
                insert into concept (
                    topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order)
                values (?, 'search.it.all-types-concept', 'search-it-all-types-concept', '가비지 컬렉션과 HashMap',
                        '한국어와 기술 식별자 검색 검증',
                        '가비지 컬렉터는 객체를 추적한다. HashMap은 키와 값을 저장한다.',
                        2, 'PUBLISHED', 998)
                returning id
                """, Long.class, topicId);
        long questionId = jdbc.queryForObject("""
                insert into question (
                    content_key, prompt_markdown, question_type, difficulty, status, explanation_markdown)
                values ('search.it.all-types-question', 'HTTP/2 연결에서 multiplexing은 왜 필요한가?',
                        'MULTIPLE_CHOICE', 'MEDIUM', 'PUBLISHED', '하나의 연결에서 여러 스트림을 처리한다.')
                returning id
                """, Long.class);
        jdbc.update("""
                insert into question_choice (question_id, choice_key, content_markdown, display_order)
                values (?, 'A', '여러 스트림을 한 연결에서 처리한다.', 0),
                       (?, 'B', '항상 연결을 새로 만든다.', 1)
                """, questionId, questionId);
        jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", questionId, conceptId);
        jdbc.update("""
                insert into personal_note (concept_id, content)
                values (?, 'ThreadLocal은 요청 경계를 넘겨 재사용하지 않는다.')
                """, conceptId);
        jdbc.update("""
                insert into wrong_note (
                    question_id, status, wrong_count, first_wrong_at, last_wrong_at, cause_note)
                values (?, 'ACTIVE', 2, current_timestamp, current_timestamp,
                        'fsync 호출과 애플리케이션 flush를 혼동했다.')
                """, questionId);
        long referenceId = jdbc.queryForObject("""
                insert into reference (url, title, reference_type, language_code, depth, recommendation)
                values ('https://search.it/reference-only', 'ReferenceOnlyMarker 공식 문서',
                        'OFFICIAL', 'en', 'DEEP', 'ReferenceOnlyMarker를 확인하는 공식 자료')
                returning id
                """, Long.class);
        jdbc.update("""
                insert into concept_reference (concept_id, reference_id, display_order, relation_note)
                values (?, ?, 0, '검색 projection reference 검증')
                """, conceptId, referenceId);
    }

    private void assertSearchContainsType(String query, String documentType) throws Exception {
        JsonNode result = search(query);
        assertTrue(result.get("totalHits").asLong() > 0, result.toString());
        for (JsonNode item : result.get("items")) {
            if (documentType.equals(item.get("documentType").asText())) return;
        }
        throw new AssertionError("Expected type=" + documentType + " for query=" + query + " result=" + result);
    }

    private JsonNode awaitSearchHit(String query, Duration timeout) throws Exception {
        long deadline = System.nanoTime() + timeout.toNanos();
        JsonNode last = null;
        while (System.nanoTime() < deadline) {
            last = search(query);
            if (last.get("totalHits").asLong() > 0) return last;
            Thread.sleep(200);
        }
        throw new AssertionError("Search projection did not converge for query=" + query + " last=" + last);
    }

    private JsonNode search(String query) throws Exception {
        String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
        HttpResponse<String> response = request("GET", "/api/search?q=" + encodedQuery, null);
        assertEquals(200, response.statusCode(), response.body());
        return objectMapper.readTree(response.body());
    }

    private void deleteSearchIndices() throws Exception {
        HttpResponse<String> response = elasticsearchGet("/csforge-search-v1-*");
        if (response.statusCode() == 404) return;
        assertEquals(200, response.statusCode(), response.body());
        JsonNode indices = objectMapper.readTree(response.body());
        for (String indexName : indices.propertyNames()) {
            HttpRequest delete = HttpRequest.newBuilder(URI.create(elasticsearchUrl() + "/" + indexName))
                    .DELETE()
                    .build();
            HttpResponse<String> deleted = HTTP.send(delete, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            assertTrue(deleted.statusCode() == 200 || deleted.statusCode() == 404, deleted.body());
        }
    }

    private HttpResponse<String> elasticsearchGet(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create(elasticsearchUrl() + path)).GET().build();
        return HTTP.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private HttpResponse<String> request(String method, String path, String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (body == null) {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            builder.header("Content-Type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        }
        return HTTP.send(builder.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private static String elasticsearchUrl() {
        return "http://" + ELASTICSEARCH.getHost() + ":" + ELASTICSEARCH.getMappedPort(9200);
    }
}
