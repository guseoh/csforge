package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
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
        jdbc.update("delete from search_outbox_event");
        jdbc.update("delete from personal_note");
        jdbc.update("delete from concept_reference");
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
        HttpResponse<String> response = request("GET", "/api/search?q=" + query, null);
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
