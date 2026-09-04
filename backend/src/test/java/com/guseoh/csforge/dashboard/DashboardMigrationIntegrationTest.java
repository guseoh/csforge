package com.guseoh.csforge.dashboard;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;
import java.time.Instant;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** V10 migration이 기존 Concept view 시각 중 실제로 알려진 값만 backfill하는지 검증한다. */
@Testcontainers
class DashboardMigrationIntegrationTest {

    private static final Instant FIRST = Instant.parse("2026-09-01T01:00:00Z");
    private static final Instant MIDDLE = Instant.parse("2026-09-02T01:00:00Z");
    private static final Instant LAST = Instant.parse("2026-09-03T01:00:00Z");

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_dashboard_migration_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @Test
    void backfillsFirstAndDistinctLastWithoutInventingIntermediateViews() {
        DataSource dataSource = dataSource();
        migrateTo(dataSource, "9");

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        long areaId = jdbc.queryForObject("SELECT id FROM learning_area WHERE slug = 'java'", Long.class);
        long topicId = insertTopic(jdbc, areaId);

        long distinctConceptId = insertConcept(jdbc, topicId, "dashboard-migration-distinct");
        long sameTimestampConceptId = insertConcept(jdbc, topicId, "dashboard-migration-same");
        long firstOnlyConceptId = insertConcept(jdbc, topicId, "dashboard-migration-first-only");

        insertProgress(jdbc, distinctConceptId, FIRST, LAST);
        insertProgress(jdbc, sameTimestampConceptId, MIDDLE, MIDDLE);
        insertProgress(jdbc, firstOnlyConceptId, FIRST, null);

        migrateTo(dataSource, "10");

        assertEquals(2, historyCount(jdbc, distinctConceptId));
        assertEquals(1, historyCountAt(jdbc, distinctConceptId, FIRST));
        assertEquals(1, historyCountAt(jdbc, distinctConceptId, LAST));
        assertEquals(0, historyCountAt(jdbc, distinctConceptId, MIDDLE));

        assertEquals(1, historyCount(jdbc, sameTimestampConceptId));
        assertEquals(1, historyCountAt(jdbc, sameTimestampConceptId, MIDDLE));

        assertEquals(1, historyCount(jdbc, firstOnlyConceptId));
        assertEquals(1, historyCountAt(jdbc, firstOnlyConceptId, FIRST));
    }

    private DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setUrl(POSTGRES.getJdbcUrl());
        dataSource.setUsername(POSTGRES.getUsername());
        dataSource.setPassword(POSTGRES.getPassword());
        return dataSource;
    }

    private void migrateTo(DataSource dataSource, String version) {
        Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .target(MigrationVersion.fromVersion(version))
                .load()
                .migrate();
    }

    private long insertTopic(JdbcTemplate jdbc, long areaId) {
        return jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order) VALUES (?, 'dashboard-migration-topic', 'dashboard-migration-topic', 'Dashboard migration topic', 999) RETURNING id",
                Long.class, areaId);
    }

    private long insertConcept(JdbcTemplate jdbc, long topicId, String contentKey) {
        return jdbc.queryForObject(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, 'Dashboard migration concept', 'content', 1, 'PUBLISHED', 999) RETURNING id",
                Long.class, topicId, contentKey, contentKey);
    }

    private void insertProgress(JdbcTemplate jdbc, long conceptId, Instant firstViewedAt, Instant lastViewedAt) {
        jdbc.update(
                "INSERT INTO concept_progress (concept_id, status, bookmarked, first_viewed_at, last_viewed_at) VALUES (?, 'LEARNING', false, ?, ?)",
                conceptId,
                sqlTimestamp(firstViewedAt),
                lastViewedAt == null ? null : sqlTimestamp(lastViewedAt));
    }

    private int historyCount(JdbcTemplate jdbc, long conceptId) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_view_history WHERE concept_id = ?",
                Integer.class,
                conceptId);
    }

    private int historyCountAt(JdbcTemplate jdbc, long conceptId, Instant viewedAt) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM concept_view_history WHERE concept_id = ? AND viewed_at = ?",
                Integer.class,
                conceptId,
                sqlTimestamp(viewedAt));
    }

    private static Timestamp sqlTimestamp(Instant instant) {
        return Timestamp.from(instant);
    }
}
