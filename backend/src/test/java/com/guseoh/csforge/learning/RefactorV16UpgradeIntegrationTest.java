package com.guseoh.csforge.learning;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Refactor release gate: isolated PostgreSQL 16.4 upgrades real V15 learning history
 * to V16 and preserves every pre-existing row. Never connects to Production.
 */
@Testcontainers
class RefactorV16UpgradeIntegrationTest {

    private static final Instant THEN = Instant.parse("2026-08-30T10:00:00Z");
    private static final String[] HISTORY_TABLES = {
            "topic", "concept", "concept_progress", "concept_view_history", "personal_note",
            "question", "question_concept", "quiz_session", "quiz_question",
            "attempt", "wrong_note", "review_schedule", "review_history"
    };

    @Container
    static final PostgreSQLContainer<?> POSTGRES =
            PostgresIntegrationTestSupport.container("csforge_refactor_v16_upgrade");

    @Test
    void existingV15HistorySurvivesV16AndExactMigrationReplay() {
        DataSource dataSource = isolatedDataSource();
        Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .target(MigrationVersion.fromVersion("15"))
                .load().migrate();

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        long area = jdbc.queryForObject("select id from learning_area where slug = 'java'", Long.class);
        long topic = jdbc.queryForObject("""
                insert into topic (learning_area_id, content_key, slug, title, display_order)
                values (?, 'gate.v16.topic', 'gate-v16-topic', 'V16 upgrade regression', 1) returning id
                """, Long.class, area);
        long concept = jdbc.queryForObject("""
                insert into concept (topic_id, content_key, slug, title, content_markdown,
                                     level, status, display_order)
                values (?, 'gate.v16.concept', 'gate-v16-concept', 'Upgrade Concept', '# Upgrade',
                        1, 'PUBLISHED', 1) returning id
                """, Long.class, topic);
        jdbc.update("""
                insert into concept_progress (concept_id, status, bookmarked,
                                              first_viewed_at, last_viewed_at)
                values (?, 'LEARNING', true, ?, ?)
                """, concept, Timestamp.from(THEN), Timestamp.from(THEN));
        jdbc.update("insert into personal_note (concept_id, content) values (?, ?)",
                concept, "user note before migration");
        jdbc.update("insert into concept_view_history (concept_id, viewed_at) values (?, ?)",
                concept, Timestamp.from(THEN));
        long question = jdbc.queryForObject("""
                insert into question (content_key, prompt_markdown, question_type,
                                      difficulty, status, explanation_markdown)
                values ('gate.v16.question', 'Upgrade question', 'SHORT_ANSWER',
                        'EASY', 'PUBLISHED', 'Migration-safe explanation') returning id
                """, Long.class);
        jdbc.update("insert into question_concept (question_id, concept_id) values (?, ?)", question, concept);
        long session = jdbc.queryForObject("""
                insert into quiz_session (status, source, started_at, submitted_at, completed_at)
                values ('COMPLETED', 'STANDARD', ?, ?, ?) returning id
                """, Long.class, Timestamp.from(THEN), Timestamp.from(THEN), Timestamp.from(THEN));
        jdbc.update("insert into quiz_question (quiz_session_id, question_id, position) values (?, ?, 0)",
                session, question);
        long attempt = jdbc.queryForObject("""
                insert into attempt (quiz_session_id, question_id, answer_text,
                                     grading_status, correct, answered_at, graded_at, outcome_processed_at)
                values (?, ?, 'bad answer', 'GRADED', false, ?, ?, ?) returning id
                """, Long.class, session, question,
                Timestamp.from(THEN), Timestamp.from(THEN), Timestamp.from(THEN));
        jdbc.update("""
                insert into wrong_note (question_id, status, wrong_count,
                                        first_wrong_at, last_wrong_at, last_wrong_attempt_id, cause_note)
                values (?, 'ACTIVE', 1, ?, ?, ?, ?)
                """, question, Timestamp.from(THEN), Timestamp.from(THEN), attempt,
                "my reasoning before migration");
        jdbc.update("""
                insert into review_schedule (question_id, status, stage, due_at, last_processed_attempt_id)
                values (?, 'SCHEDULED', 1, ?, ?)
                """, question, Timestamp.from(THEN.plusSeconds(86_400)), attempt);
        jdbc.update("""
                insert into review_history (question_id, quiz_session_id, attempt_id, result,
                                            stage_before, stage_after, reviewed_at, next_due_at)
                values (?, ?, ?, 'WRONG', 1, 1, ?, ?)
                """, question, session, attempt,
                Timestamp.from(THEN), Timestamp.from(THEN.plusSeconds(86_400)));

        Map<String, List<Map<String, Object>>> before = snapshot(jdbc);
        assertEquals(1, before.get("attempt").size());
        assertEquals(1, before.get("review_history").size());

        int migrated = Flyway.configure().dataSource(dataSource)
                .locations("classpath:db/migration").target("16").load().migrate().migrationsExecuted;
        assertEquals(1, migrated, "V16 should be the only outstanding version");
        assertEquals(before, snapshot(jdbc), "all historical rows and original values must survive V16");
        assertEquals(3, jdbc.queryForObject("select count(*) from bookmark_category", Integer.class));
        assertEquals(0, jdbc.queryForObject("select count(*) from bookmark_category_concept", Integer.class),
                "existing bookmarks remain bookmarked but initially unclassified");
        assertTrue(jdbc.queryForObject("select bookmarked from concept_progress where concept_id = ?",
                Boolean.class, concept));

        long firstCategory = jdbc.queryForObject(
                "select id from bookmark_category where display_order = 1", Long.class);
        long secondCategory = jdbc.queryForObject(
                "select id from bookmark_category where display_order = 2", Long.class);
        jdbc.update("insert into bookmark_category_concept (concept_id, category_id) values (?, ?)",
                concept, firstCategory);
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "insert into bookmark_category_concept (concept_id, category_id) values (?, ?)",
                concept, secondCategory));
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "insert into bookmark_category (name, display_order) values ('다시 읽기', 99)"));
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "insert into bookmark_category (name, display_order) values ('   ', 99)"));
        assertThrows(DataIntegrityViolationException.class, () -> jdbc.update(
                "delete from bookmark_category where id = ?", firstCategory));
        jdbc.update("update bookmark_category_concept set category_id = ? where concept_id = ?",
                secondCategory, concept);
        assertEquals(secondCategory, jdbc.queryForObject(
                "select category_id from bookmark_category_concept where concept_id = ?",
                Long.class, concept));
        jdbc.update("delete from bookmark_category_concept where concept_id = ?", concept);

        assertEquals(0, Flyway.configure().dataSource(dataSource)
                .locations("classpath:db/migration").target("16").load().migrate().migrationsExecuted,
                "exact second Flyway migration must be unchanged");
        assertEquals(before, snapshot(jdbc));
        assertEquals(16, jdbc.queryForObject(
                "select max(installed_rank) from flyway_schema_history where success = true", Integer.class));
    }

    private static Map<String, List<Map<String, Object>>> snapshot(JdbcTemplate jdbc) {
        Map<String, List<Map<String, Object>>> data = new LinkedHashMap<>();
        for (String table : HISTORY_TABLES) {
            String pk = switch (table) {
                case "concept_progress" -> "concept_id";
                case "question_concept", "review_schedule" -> "question_id";
                default -> "id";
            };
            data.put(table, jdbc.queryForList("select * from " + table + " order by " + pk));
        }
        return data;
    }

    private static DataSource isolatedDataSource() {
        DriverManagerDataSource source = new DriverManagerDataSource();
        source.setUrl(POSTGRES.getJdbcUrl());
        source.setUsername(POSTGRES.getUsername());
        source.setPassword(POSTGRES.getPassword());
        return source;
    }
}
