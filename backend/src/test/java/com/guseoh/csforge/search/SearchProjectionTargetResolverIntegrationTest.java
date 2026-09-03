package com.guseoh.csforge.search;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Set;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchDocumentRef;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchProjectionTargetResolver;
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

/** hierarchy/source 변경이 갱신해야 할 denormalized Search 문서를 bounded resolver가 올바르게 확장하는지 검증한다. */
@Testcontainers
@SpringBootTest
class SearchProjectionTargetResolverIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_search_target_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    SearchProjectionTargetResolver targetResolver;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @BeforeEach
    void cleanFixture() {
        jdbc.update("delete from wrong_note where question_id in (select id from question where content_key like 'search.target.%')");
        jdbc.update("delete from question_concept where question_id in (select id from question where content_key like 'search.target.%')");
        jdbc.update("delete from question where content_key like 'search.target.%'");
        jdbc.update("delete from personal_note where concept_id in (select id from concept where content_key like 'search.target.%')");
        jdbc.update("delete from concept_reference where concept_id in (select id from concept where content_key like 'search.target.%')");
        jdbc.update("delete from reference where url like 'https://search.target/%'");
        jdbc.update("delete from concept where content_key like 'search.target.%'");
        jdbc.update("delete from topic where content_key like 'search.target.%'");
    }

    @Test
    void topicConceptAndQuestionChangesExpandToAllAffectedProjectionTypes() {
        Fixture fixture = insertFixture();
        Set<SearchDocumentRef> allExpected = Set.of(
                new SearchDocumentRef(SearchDocumentType.CONCEPT, fixture.conceptId()),
                new SearchDocumentRef(SearchDocumentType.QUESTION, fixture.questionId()),
                new SearchDocumentRef(SearchDocumentType.PERSONAL_NOTE, fixture.noteId()),
                new SearchDocumentRef(SearchDocumentType.WRONG_NOTE, fixture.wrongNoteId()),
                new SearchDocumentRef(SearchDocumentType.REFERENCE, fixture.referenceId()));

        assertEquals(allExpected, targetResolver.resolve(SearchChangeType.TOPIC, fixture.topicId()));
        assertEquals(allExpected, targetResolver.resolve(SearchChangeType.CONCEPT, fixture.conceptId()));
        assertEquals(Set.of(
                        new SearchDocumentRef(SearchDocumentType.QUESTION, fixture.questionId()),
                        new SearchDocumentRef(SearchDocumentType.WRONG_NOTE, fixture.wrongNoteId())),
                targetResolver.resolve(SearchChangeType.QUESTION, fixture.questionId()));
        assertEquals(Set.of(new SearchDocumentRef(SearchDocumentType.PERSONAL_NOTE, fixture.noteId())),
                targetResolver.resolve(SearchChangeType.PERSONAL_NOTE, fixture.noteId()));
        assertEquals(Set.of(new SearchDocumentRef(SearchDocumentType.REFERENCE, fixture.referenceId())),
                targetResolver.resolve(SearchChangeType.REFERENCE, fixture.referenceId()));
        assertEquals(Set.of(new SearchDocumentRef(SearchDocumentType.WRONG_NOTE, fixture.wrongNoteId())),
                targetResolver.resolve(SearchChangeType.WRONG_NOTE, fixture.wrongNoteId()));
    }

    private Fixture insertFixture() {
        long areaId = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long topicId = jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order, active)
                values (?, 'search.target.topic', 'search-target-topic', 'Search target topic', 994, true)
                returning id
                """, Long.class, areaId);
        long conceptId = jdbc.queryForObject("""
                insert into concept (
                    topic_id, content_key, slug, title, summary, content_markdown, level, status, display_order)
                values (?, 'search.target.concept', 'search-target-concept', 'Search target concept',
                        'target summary', 'target body', 1, 'PUBLISHED', 994)
                returning id
                """, Long.class, topicId);
        long questionId = jdbc.queryForObject("""
                insert into question (
                    content_key, prompt_markdown, question_type, difficulty, status, explanation_markdown)
                values ('search.target.question', 'Search target question?',
                        'SHORT_ANSWER', 'MEDIUM', 'PUBLISHED', 'target explanation')
                returning id
                """, Long.class);
        jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", questionId, conceptId);
        long noteId = jdbc.queryForObject("""
                insert into personal_note (concept_id, content)
                values (?, 'target personal note') returning id
                """, Long.class, conceptId);
        long wrongNoteId = jdbc.queryForObject("""
                insert into wrong_note (
                    question_id, status, wrong_count, first_wrong_at, last_wrong_at, cause_note)
                values (?, 'ACTIVE', 1, current_timestamp, current_timestamp, 'target wrong note') returning id
                """, Long.class, questionId);
        long referenceId = jdbc.queryForObject("""
                insert into reference (url, title, reference_type, language_code, depth, recommendation)
                values ('https://search.target/reference', 'Search target reference',
                        'OFFICIAL', 'en', 'DEEP', 'target recommendation') returning id
                """, Long.class);
        jdbc.update("""
                insert into concept_reference (concept_id, reference_id, display_order, relation_note)
                values (?, ?, 0, 'target relation')
                """, conceptId, referenceId);
        return new Fixture(topicId, conceptId, questionId, noteId, wrongNoteId, referenceId);
    }

    private record Fixture(
            long topicId,
            long conceptId,
            long questionId,
            long noteId,
            long wrongNoteId,
            long referenceId) { }
}
