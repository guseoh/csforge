package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.guseoh.csforge.search.application.SearchDocumentRef;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchProjectionLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** canonical 상태와 hierarchy에 따라 Search projection이 생성되거나 제거되는 규칙을 검증한다. */
@Testcontainers
@SpringBootTest
class SearchProjectionEligibilityIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_search_eligibility_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    SearchProjectionLoader projectionLoader;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @BeforeEach
    void cleanFixture() {
        jdbc.update("delete from concept_reference");
        jdbc.update("delete from reference where url like 'https://search.eligibility/%'");
        jdbc.update("delete from concept");
        jdbc.update("delete from topic where content_key like 'search.eligibility.%'");
    }

    @Test
    void draftArchivedInactiveHierarchyAndOrphanReferenceAreNotSearchable() {
        long areaId = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long topicId = jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order, active)
                values (?, 'search.eligibility.topic', 'search-eligibility-topic', 'Search eligibility', 995, true)
                returning id
                """, Long.class, areaId);
        long publishedId = insertConcept(topicId, "published", "PUBLISHED");
        long draftId = insertConcept(topicId, "draft", "DRAFT");
        long archivedId = insertConcept(topicId, "archived", "ARCHIVED");
        long linkedReferenceId = insertReference("linked");
        long orphanReferenceId = insertReference("orphan");
        jdbc.update("""
                insert into concept_reference (concept_id, reference_id, display_order, relation_note)
                values (?, ?, 0, 'linked to searchable concept')
                """, publishedId, linkedReferenceId);

        assertTrue(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.CONCEPT, publishedId)).isPresent());
        assertFalse(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.CONCEPT, draftId)).isPresent());
        assertFalse(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.CONCEPT, archivedId)).isPresent());
        assertTrue(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.REFERENCE, linkedReferenceId)).isPresent());
        assertFalse(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.REFERENCE, orphanReferenceId)).isPresent());

        jdbc.update("update topic set active = false where id = ?", topicId);

        assertFalse(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.CONCEPT, publishedId)).isPresent());
        assertFalse(projectionLoader.load(new SearchDocumentRef(SearchDocumentType.REFERENCE, linkedReferenceId)).isPresent());
    }

    private long insertConcept(long topicId, String suffix, String status) {
        return jdbc.queryForObject("""
                insert into concept (
                    topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order)
                values (?, ?, ?, ?, 'eligibility summary', 'eligibility body', 1, ?, 995)
                returning id
                """,
                Long.class,
                topicId,
                "search.eligibility." + suffix,
                "search-eligibility-" + suffix,
                "Search eligibility " + suffix,
                status);
    }

    private long insertReference(String suffix) {
        return jdbc.queryForObject("""
                insert into reference (url, title, reference_type, language_code, depth, recommendation)
                values (?, ?, 'OFFICIAL', 'en', 'DEEP', 'eligibility reference')
                returning id
                """,
                Long.class,
                "https://search.eligibility/" + suffix,
                "Search eligibility " + suffix);
    }
}
