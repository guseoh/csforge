package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.guseoh.csforge.learning.application.LearningCommandService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import com.guseoh.csforge.search.application.SearchCriteria;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchPageView;
import com.guseoh.csforge.search.application.SearchQueryService;
import com.guseoh.csforge.search.application.SearchResultItem;
import com.guseoh.csforge.search.application.SearchSort;
import com.guseoh.csforge.search.application.SearchSuggestionView;
import com.guseoh.csforge.wrongnote.application.WrongNoteCommandService;
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

/** PostgreSQL 직접 검색의 문서 종류, 필터, 정렬, highlight와 즉시 일관성을 검증한다. */
@Testcontainers
@SpringBootTest
class PostgresSearchIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_postgres_search_test");

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    SearchQueryService searchQueryService;

    @Autowired
    LearningCommandService learningCommandService;

    @Autowired
    WrongNoteCommandService wrongNoteCommandService;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @BeforeEach
    void cleanFixture() {
        jdbc.update("delete from wrong_note where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question_answer where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question_choice where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question_concept where question_id in (select id from question where content_key like 'search.it.%')");
        jdbc.update("delete from question where content_key like 'search.it.%'");
        jdbc.update("delete from personal_note where concept_id in (select id from concept where content_key like 'search.it.%')");
        jdbc.update("delete from concept_reference where concept_id in (select id from concept where content_key like 'search.it.%')");
        jdbc.update("delete from reference where url like 'https://search.it/%'");
        jdbc.update("delete from concept where content_key like 'search.it.%'");
        jdbc.update("delete from topic where content_key like 'search.it.%'");
        jdbc.update("delete from learning_area where slug like 'search-it-%'");
    }

    @Test
    void searchesAllDocumentTypesWithFiltersStablePagingHighlightAndSuggestions() {
        Fixture fixture = insertFixture();

        SearchPageView allTypes = search(criteria("SearchMarker", List.of(), List.of(), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20));
        assertEquals(5, allTypes.totalHits());
        assertEquals(Set.of(SearchDocumentType.CONCEPT, SearchDocumentType.QUESTION,
                SearchDocumentType.PERSONAL_NOTE, SearchDocumentType.WRONG_NOTE, SearchDocumentType.REFERENCE),
                allTypes.items().stream().map(SearchResultItem::documentType).collect(Collectors.toSet()));

        SearchPageView conceptByArea = search(criteria("SharedFilterMarker", List.of(SearchDocumentType.CONCEPT),
                List.of("database"), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20));
        assertEquals(List.of("Alpha SharedFilterMarker"), titles(conceptByArea));

        SearchPageView conceptByTopicAndLevel = search(criteria("SharedFilterMarker", List.of(SearchDocumentType.CONCEPT),
                List.of(), List.of(fixture.databaseTopicKey()), List.of(3), SearchSort.RELEVANCE, 0, 20));
        assertEquals(List.of("Alpha SharedFilterMarker"), titles(conceptByTopicAndLevel));

        SearchPageView firstPage = search(criteria("SharedFilterMarker", List.of(SearchDocumentType.CONCEPT),
                List.of(), List.of(), List.of(), SearchSort.TITLE, 0, 1));
        SearchPageView secondPage = search(criteria("SharedFilterMarker", List.of(SearchDocumentType.CONCEPT),
                List.of(), List.of(), List.of(), SearchSort.TITLE, 1, 1));
        assertEquals(2, firstPage.totalHits());
        assertEquals(2, firstPage.totalPages());
        assertEquals(List.of("Alpha SharedFilterMarker"), titles(firstPage));
        assertEquals(List.of("Zulu SharedFilterMarker"), titles(secondPage));

        SearchPageView recent = search(criteria("SharedFilterMarker", List.of(SearchDocumentType.CONCEPT),
                List.of(), List.of(), List.of(), SearchSort.RECENT, 0, 20));
        assertEquals("Alpha SharedFilterMarker", recent.items().getFirst().title());

        SearchPageView highlighted = search(criteria("SearchMarker", List.of(SearchDocumentType.CONCEPT),
                List.of(), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20));
        assertTrue(highlighted.items().getFirst().snippet().contains("[[H]]SearchMarker[[/H]]"));

        List<SearchSuggestionView> suggestions = searchQueryService.suggest("Alpha", 8);
        assertFalse(suggestions.isEmpty());
        assertEquals("Alpha SharedFilterMarker", suggestions.getFirst().title());
    }

    @Test
    void multiTermSearchMatchesTermsSeparatedInTheDocumentAndHighlightsEachTerm() {
        Fixture fixture = insertFixture();
        jdbc.update("""
                update concept
                set summary = 'volatile visibility details appear here while happens-before ordering appears later'
                where id = ?
                """, fixture.conceptId());

        SearchPageView result = search(criteria("volatile happens-before", List.of(SearchDocumentType.CONCEPT),
                List.of(), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20));

        assertEquals(1, result.totalHits());
        assertEquals(fixture.conceptId(), result.items().getFirst().sourceId());
        assertTrue(result.items().getFirst().snippet().contains("[[H]]volatile[[/H]]"));
        assertTrue(result.items().getFirst().snippet().contains("[[H]]happens-before[[/H]]"));
    }

    @Test
    void excludesUnpublishedInactiveAndBlankDocuments() {
        long activeAreaId = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long activeTopicId = insertTopic(activeAreaId, "search.it.eligible.topic", "Eligible topic", true);
        long draftConceptId = insertConcept(activeTopicId, "search.it.draft.concept", "ExcludedMarker draft concept", 1, "DRAFT");
        long activeConceptId = insertConcept(activeTopicId, "search.it.active.concept", "Eligible concept", 1, "PUBLISHED");
        long inactiveTopicId = insertTopic(activeAreaId, "search.it.inactive.topic", "Inactive topic", false);
        insertConcept(inactiveTopicId, "search.it.inactive.concept", "ExcludedMarker inactive topic", 1, "PUBLISHED");
        long inactiveAreaId = jdbc.queryForObject("""
                insert into learning_area (slug, name, display_order, active)
                values ('search-it-inactive-area', 'Inactive area', 99, false)
                returning id
                """, Long.class);
        long inactiveAreaTopicId = insertTopic(inactiveAreaId, "search.it.inactive-area.topic", "Inactive area topic", true);
        insertConcept(inactiveAreaTopicId, "search.it.inactive-area.concept", "ExcludedMarker inactive area", 1, "PUBLISHED");

        long questionId = jdbc.queryForObject("""
                insert into question (content_key, prompt_markdown, question_type, difficulty, status)
                values ('search.it.excluded.question', 'ExcludedMarker unpublished context question', 'SHORT_ANSWER', 'EASY', 'PUBLISHED')
                returning id
                """, Long.class);
        jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", questionId, draftConceptId);
        long referenceId = jdbc.queryForObject("""
                insert into reference (url, title, reference_type)
                values ('https://search.it/excluded-reference', 'ExcludedMarker reference', 'OFFICIAL')
                returning id
                """, Long.class);
        jdbc.update("insert into concept_reference (concept_id, reference_id, display_order) values (?, ?, 0)", draftConceptId, referenceId);
        jdbc.update("insert into personal_note (concept_id, content) values (?, '   ')", activeConceptId);

        SearchPageView excluded = search(criteria("ExcludedMarker", List.of(), List.of(), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20));

        assertEquals(0, excluded.totalHits());
    }

    @Test
    void writesBecomeSearchableAfterTheTransactionCommits() {
        Fixture fixture = insertFixture();

        learningCommandService.upsertNote(fixture.conceptId(), "ImmediateNoteMarker");
        assertEquals(1, search(criteria("ImmediateNoteMarker", List.of(), List.of(), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20)).totalHits());

        wrongNoteCommandService.saveNote(fixture.questionId(), "ImmediateWrongMarker");
        SearchPageView result = search(criteria("ImmediateWrongMarker", List.of(), List.of(), List.of(), List.of(), SearchSort.RELEVANCE, 0, 20));
        assertEquals(1, result.totalHits());
        assertEquals(SearchDocumentType.WRONG_NOTE, result.items().getFirst().documentType());
    }

    private Fixture insertFixture() {
        long javaAreaId = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long databaseAreaId = jdbc.queryForObject("select id from learning_area where slug = 'database'", Long.class);
        long javaTopicId = insertTopic(javaAreaId, "search.it.java.topic", "Java search topic", true);
        long databaseTopicId = insertTopic(databaseAreaId, "search.it.database.topic", "Database search topic", true);
        long zuluConceptId = insertConcept(javaTopicId, "search.it.zulu.concept", "Zulu SharedFilterMarker", 1, "PUBLISHED");
        long alphaConceptId = insertConcept(databaseTopicId, "search.it.alpha.concept", "Alpha SharedFilterMarker", 3, "PUBLISHED");
        jdbc.update("update concept set summary = 'SearchMarker concept summary', content_markdown = 'SearchMarker concept body' where id = ?", zuluConceptId);
        long questionId = jdbc.queryForObject("""
                insert into question (content_key, prompt_markdown, question_type, difficulty, status, explanation_markdown)
                values ('search.it.question', 'SearchMarker question prompt', 'SHORT_ANSWER', 'MEDIUM', 'PUBLISHED', 'SearchMarker explanation')
                returning id
                """, Long.class);
        jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", questionId, zuluConceptId);
        jdbc.update("insert into personal_note (concept_id, content) values (?, 'SearchMarker personal note')", zuluConceptId);
        jdbc.update("""
                insert into wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at, cause_note)
                values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, 'SearchMarker wrong note')
                """, questionId);
        long referenceId = jdbc.queryForObject("""
                insert into reference (url, title, reference_type, recommendation)
                values ('https://search.it/reference', 'Search reference', 'OFFICIAL', 'SearchMarker reference')
                returning id
                """, Long.class);
        jdbc.update("insert into concept_reference (concept_id, reference_id, display_order, relation_note) values (?, ?, 0, 'SearchMarker relation')", zuluConceptId, referenceId);
        jdbc.update("update concept set updated_at = current_timestamp - interval '1 minute' where id = ?", zuluConceptId);
        return new Fixture(zuluConceptId, questionId, "search.it.database.topic");
    }

    private long insertTopic(long areaId, String contentKey, String title, boolean active) {
        return jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order, active)
                values (?, ?, ?, ?, 999, ?)
                returning id
                """, Long.class, areaId, contentKey, contentKey.replace('.', '-'), title, active);
    }

    private long insertConcept(long topicId, String contentKey, String title, int level, String status) {
        return jdbc.queryForObject("""
                insert into concept (topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order)
                values (?, ?, ?, ?, 'search summary', 'search body', ?, ?, 999)
                returning id
                """, Long.class, topicId, contentKey, contentKey.replace('.', '-'), title, level, status);
    }

    private SearchPageView search(SearchCriteria criteria) {
        return searchQueryService.search(criteria);
    }

    private static List<String> titles(SearchPageView page) {
        return page.items().stream().map(SearchResultItem::title).toList();
    }

    private static SearchCriteria criteria(String query, List<SearchDocumentType> types, List<String> areas,
            List<String> topics, List<Integer> levels, SearchSort sort, int page, int size) {
        return new SearchCriteria(query, types, areas, topics, levels, sort, page, size);
    }

    private record Fixture(long conceptId, long questionId, String databaseTopicKey) {
    }
}
