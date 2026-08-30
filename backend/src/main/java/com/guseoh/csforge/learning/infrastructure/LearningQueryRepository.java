package com.guseoh.csforge.learning.infrastructure;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.guseoh.csforge.learning.api.ConceptSort;
import com.guseoh.csforge.learning.api.LearningDtos;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.ReferenceType;

@Repository
public class LearningQueryRepository {

    private static final String ACTIVE_PUBLISHED_CONCEPT = "c.status = 'PUBLISHED'";

    private final NamedParameterJdbcTemplate jdbc;

    public LearningQueryRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<LearningDtos.AreaSummary> findAreaSummaries() {
        String sql = """
                SELECT la.id, la.slug, la.name, la.description,
                       COUNT(DISTINCT t.id) AS topic_count,
                       COUNT(c.id) AS published_concept_count,
                       COUNT(c.id) FILTER (WHERE COALESCE(cp.status, 'UNSEEN') = 'COMPLETED') AS completed_concept_count,
                       COUNT(c.id) FILTER (WHERE COALESCE(cp.bookmarked, FALSE)) AS bookmarked_concept_count,
                       COUNT(c.id) FILTER (WHERE c.level = 1) AS level1_total,
                       COUNT(c.id) FILTER (WHERE c.level = 1 AND COALESCE(cp.status, 'UNSEEN') = 'COMPLETED') AS level1_completed,
                       COUNT(c.id) FILTER (WHERE c.level = 2) AS level2_total,
                       COUNT(c.id) FILTER (WHERE c.level = 2 AND COALESCE(cp.status, 'UNSEEN') = 'COMPLETED') AS level2_completed,
                       COUNT(c.id) FILTER (WHERE c.level = 3) AS level3_total,
                       COUNT(c.id) FILTER (WHERE c.level = 3 AND COALESCE(cp.status, 'UNSEEN') = 'COMPLETED') AS level3_completed
                FROM learning_area la
                LEFT JOIN topic t ON t.learning_area_id = la.id AND t.active = TRUE
                LEFT JOIN concept c ON c.topic_id = t.id AND c.status = 'PUBLISHED'
                LEFT JOIN concept_progress cp ON cp.concept_id = c.id
                WHERE la.active = TRUE
                GROUP BY la.id, la.slug, la.name, la.description, la.display_order
                ORDER BY la.display_order, la.id
                """;
        return jdbc.query(sql, areaSummaryRowMapper());
    }

    public Optional<LearningDtos.AreaDetail> findAreaDetail(String areaSlug) {
        String areaSql = """
                SELECT id, slug, name, description
                FROM learning_area
                WHERE slug = :areaSlug AND active = TRUE
                """;
        MapSqlParameterSource params = new MapSqlParameterSource("areaSlug", areaSlug);
        List<LearningDtos.AreaDetail> areaRows = jdbc.query(areaSql, params, (rs, rowNum) ->
                new LearningDtos.AreaDetail(
                        rs.getLong("id"),
                        rs.getString("slug"),
                        rs.getString("name"),
                        rs.getString("description"),
                        List.of()));
        if (areaRows.isEmpty()) {
            return Optional.empty();
        }

        String topicSql = """
                SELECT t.id, t.slug, t.title, t.description,
                       COUNT(c.id) AS published_concept_count,
                       COUNT(c.id) FILTER (WHERE COALESCE(cp.status, 'UNSEEN') = 'COMPLETED') AS completed_concept_count,
                       COUNT(c.id) FILTER (WHERE COALESCE(cp.bookmarked, FALSE)) AS bookmarked_concept_count,
                       COUNT(c.id) FILTER (WHERE c.level = 1) AS level1_count,
                       COUNT(c.id) FILTER (WHERE c.level = 2) AS level2_count,
                       COUNT(c.id) FILTER (WHERE c.level = 3) AS level3_count,
                       COUNT(c.id) FILTER (WHERE COALESCE(cp.status, 'UNSEEN') = 'UNSEEN') AS unseen_count,
                       COUNT(c.id) FILTER (WHERE cp.status = 'LEARNING') AS learning_count,
                       COUNT(c.id) FILTER (WHERE cp.status = 'REVIEW_NEEDED') AS review_needed_count
                FROM topic t
                JOIN learning_area la ON la.id = t.learning_area_id
                LEFT JOIN concept c ON c.topic_id = t.id AND c.status = 'PUBLISHED'
                LEFT JOIN concept_progress cp ON cp.concept_id = c.id
                WHERE la.slug = :areaSlug
                  AND la.active = TRUE
                  AND t.active = TRUE
                GROUP BY t.id, t.slug, t.title, t.description, t.display_order
                ORDER BY t.display_order, t.id
                """;
        List<LearningDtos.TopicSummary> topics = jdbc.query(topicSql, params, topicSummaryRowMapper());
        LearningDtos.AreaDetail area = areaRows.getFirst();
        return Optional.of(new LearningDtos.AreaDetail(
                area.id(), area.slug(), area.name(), area.description(), topics));
    }

    public ConceptPageResult findConceptPage(ConceptFilter filter) {
        MapSqlParameterSource params = new MapSqlParameterSource();
        String whereClause = conceptWhereClause(filter, params);

        String countSql = """
                SELECT COUNT(*)
                FROM concept c
                JOIN topic t ON t.id = c.topic_id AND t.active = TRUE
                JOIN learning_area la ON la.id = t.learning_area_id AND la.active = TRUE
                LEFT JOIN concept_progress cp ON cp.concept_id = c.id
                WHERE %s
                """.formatted(whereClause);
        long totalElements = jdbc.queryForObject(countSql, params, Long.class);

        String dataSql = """
                SELECT c.id, la.slug AS area_slug, la.name AS area_name,
                       t.id AS topic_id, t.slug AS topic_slug, t.title AS topic_title,
                       c.title, c.summary, c.level, c.status AS content_status,
                       COALESCE(cp.status, 'UNSEEN') AS learning_status,
                       COALESCE(cp.bookmarked, FALSE) AS bookmarked,
                       cp.last_viewed_at
                FROM concept c
                JOIN topic t ON t.id = c.topic_id AND t.active = TRUE
                JOIN learning_area la ON la.id = t.learning_area_id AND la.active = TRUE
                LEFT JOIN concept_progress cp ON cp.concept_id = c.id
                WHERE %s
                ORDER BY %s
                LIMIT :pageSize OFFSET :offset
                """.formatted(whereClause, orderBy(filter.sort()));
        params.addValue("pageSize", filter.size());
        params.addValue("offset", filter.page() * filter.size());
        List<LearningDtos.ConceptListItem> items = jdbc.query(dataSql, params, conceptListItemRowMapper());

        int totalPages = totalElements == 0 ? 0 : (int) ((totalElements + filter.size() - 1) / filter.size());
        LearningDtos.PageMetadata page = new LearningDtos.PageMetadata(
                filter.page(), filter.size(), totalElements, totalPages,
                filter.page() + 1 < totalPages, filter.page() > 0);
        return new ConceptPageResult(items, page);
    }

    public Optional<ConceptHeader> findConceptHeader(long conceptId) {
        String sql = """
                SELECT c.id, c.content_key, c.slug, c.title, c.summary, c.content_markdown,
                       c.level, c.status AS content_status, c.display_order AS concept_display_order,
                       t.id AS topic_id, t.slug AS topic_slug, t.title AS topic_title,
                       la.id AS area_id, la.slug AS area_slug, la.name AS area_name,
                       COALESCE(cp.status, 'UNSEEN') AS learning_status,
                       COALESCE(cp.bookmarked, FALSE) AS bookmarked,
                       cp.first_viewed_at, cp.last_viewed_at, cp.completed_at,
                       pn.content AS note_content, pn.updated_at AS note_updated_at
                FROM concept c
                JOIN topic t ON t.id = c.topic_id AND t.active = TRUE
                JOIN learning_area la ON la.id = t.learning_area_id AND la.active = TRUE
                LEFT JOIN concept_progress cp ON cp.concept_id = c.id
                LEFT JOIN personal_note pn ON pn.concept_id = c.id
                WHERE c.id = :conceptId AND c.status = 'PUBLISHED'
                """;
        List<ConceptHeader> rows = jdbc.query(sql,
                new MapSqlParameterSource("conceptId", conceptId), conceptHeaderRowMapper());
        return rows.stream().findFirst();
    }

    public List<LearningDtos.ReferenceDetail> findReferences(long conceptId) {
        String sql = """
                SELECT r.id, r.url, r.title, r.reference_type, r.language_code,
                       r.depth, r.recommendation, cr.display_order, cr.relation_note
                FROM concept_reference cr
                JOIN reference r ON r.id = cr.reference_id
                WHERE cr.concept_id = :conceptId
                ORDER BY cr.display_order, r.id
                """;
        return jdbc.query(sql, new MapSqlParameterSource("conceptId", conceptId), (rs, rowNum) ->
                new LearningDtos.ReferenceDetail(
                        rs.getLong("id"),
                        rs.getString("url"),
                        rs.getString("title"),
                        ReferenceType.valueOf(rs.getString("reference_type")),
                        rs.getString("language_code"),
                        rs.getString("depth"),
                        rs.getString("recommendation"),
                        rs.getInt("display_order"),
                        rs.getString("relation_note")));
    }

    public List<NavigationRow> findNavigation(long conceptId) {
        String sql = """
                WITH ordered AS (
                    SELECT c.id, c.title, c.level,
                           ROW_NUMBER() OVER (
                               ORDER BY la.display_order, t.display_order, c.display_order, c.id
                           ) AS position
                    FROM concept c
                    JOIN topic t ON t.id = c.topic_id AND t.active = TRUE
                    JOIN learning_area la ON la.id = t.learning_area_id AND la.active = TRUE
                    WHERE c.status = 'PUBLISHED'
                ), current_concept AS (
                    SELECT position FROM ordered WHERE id = :conceptId
                )
                SELECT o.id, o.title, o.level, o.position, current_row.position AS current_position
                FROM ordered o
                CROSS JOIN current_concept current_row
                WHERE o.position IN (current_row.position - 1, current_row.position + 1)
                ORDER BY o.position
                """;
        return jdbc.query(sql, new MapSqlParameterSource("conceptId", conceptId), (rs, rowNum) ->
                new NavigationRow(
                        new LearningDtos.ConceptNavigation(
                                rs.getLong("id"), rs.getString("title"), rs.getShort("level")),
                        rs.getLong("position") < rs.getLong("current_position")));
    }

    public List<LearningDtos.ConceptNavigation> findRelated(long conceptId, long topicId, int displayOrder) {
        String sql = """
                SELECT id, title, level
                FROM concept
                WHERE topic_id = :topicId
                  AND status = 'PUBLISHED'
                  AND id <> :conceptId
                ORDER BY ABS(display_order - :displayOrder), display_order, id
                LIMIT 5
                """;
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("topicId", topicId)
                .addValue("conceptId", conceptId)
                .addValue("displayOrder", displayOrder);
        return jdbc.query(sql, params, (rs, rowNum) ->
                new LearningDtos.ConceptNavigation(
                        rs.getLong("id"), rs.getString("title"), rs.getShort("level")));
    }

    private String conceptWhereClause(ConceptFilter filter, MapSqlParameterSource params) {
        List<String> conditions = new ArrayList<>();
        conditions.add(ACTIVE_PUBLISHED_CONCEPT);
        if (filter.area() != null) {
            conditions.add("la.slug = :area");
            params.addValue("area", filter.area());
        }
        if (filter.topicId() != null) {
            conditions.add("c.topic_id = :topicId");
            params.addValue("topicId", filter.topicId());
        }
        if (filter.level() != null) {
            conditions.add("c.level = :level");
            params.addValue("level", filter.level());
        }
        if (filter.learningStatus() != null) {
            conditions.add("COALESCE(cp.status, 'UNSEEN') = :learningStatus");
            params.addValue("learningStatus", filter.learningStatus().name());
        }
        if (filter.bookmarked() != null) {
            conditions.add("COALESCE(cp.bookmarked, FALSE) = :bookmarked");
            params.addValue("bookmarked", filter.bookmarked());
        }
        if (filter.q() != null && !filter.q().isBlank()) {
            conditions.add("(c.title ILIKE CONCAT('%', :q, '%') OR COALESCE(c.summary, '') ILIKE CONCAT('%', :q, '%'))");
            params.addValue("q", filter.q());
        }
        return String.join(" AND ", conditions);
    }

    private String orderBy(ConceptSort sort) {
        return switch (sort) {
            case CURRICULUM -> "la.display_order, t.display_order, c.display_order, c.id";
            case TITLE -> "LOWER(c.title), c.id";
            case UPDATED -> "c.updated_at DESC NULLS LAST, c.id";
            case VIEWED -> "cp.last_viewed_at DESC NULLS LAST, c.id";
        };
    }

    private RowMapper<LearningDtos.AreaSummary> areaSummaryRowMapper() {
        return (rs, rowNum) -> new LearningDtos.AreaSummary(
                rs.getLong("id"),
                rs.getString("slug"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getLong("topic_count"),
                rs.getLong("published_concept_count"),
                rs.getLong("completed_concept_count"),
                rs.getLong("bookmarked_concept_count"),
                new LearningDtos.LevelProgress(rs.getLong("level1_total"), rs.getLong("level1_completed")),
                new LearningDtos.LevelProgress(rs.getLong("level2_total"), rs.getLong("level2_completed")),
                new LearningDtos.LevelProgress(rs.getLong("level3_total"), rs.getLong("level3_completed")));
    }

    private RowMapper<LearningDtos.TopicSummary> topicSummaryRowMapper() {
        return (rs, rowNum) -> new LearningDtos.TopicSummary(
                rs.getLong("id"),
                rs.getString("slug"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getLong("published_concept_count"),
                rs.getLong("completed_concept_count"),
                rs.getLong("bookmarked_concept_count"),
                rs.getLong("level1_count"),
                rs.getLong("level2_count"),
                rs.getLong("level3_count"),
                rs.getLong("unseen_count"),
                rs.getLong("learning_count"),
                rs.getLong("review_needed_count"));
    }

    private RowMapper<LearningDtos.ConceptListItem> conceptListItemRowMapper() {
        return (rs, rowNum) -> new LearningDtos.ConceptListItem(
                rs.getLong("id"),
                rs.getString("area_slug"),
                rs.getString("area_name"),
                rs.getLong("topic_id"),
                rs.getString("topic_slug"),
                rs.getString("topic_title"),
                rs.getString("title"),
                rs.getString("summary"),
                rs.getShort("level"),
                ContentStatus.valueOf(rs.getString("content_status")),
                LearningStatus.valueOf(rs.getString("learning_status")),
                rs.getBoolean("bookmarked"),
                instant(rs, "last_viewed_at"));
    }

    private RowMapper<ConceptHeader> conceptHeaderRowMapper() {
        return (rs, rowNum) -> new ConceptHeader(
                rs.getLong("id"),
                rs.getString("content_key"),
                rs.getString("slug"),
                rs.getString("title"),
                rs.getString("summary"),
                rs.getString("content_markdown"),
                rs.getShort("level"),
                ContentStatus.valueOf(rs.getString("content_status")),
                rs.getInt("concept_display_order"),
                rs.getLong("area_id"),
                rs.getString("area_slug"),
                rs.getString("area_name"),
                rs.getLong("topic_id"),
                rs.getString("topic_slug"),
                rs.getString("topic_title"),
                LearningStatus.valueOf(rs.getString("learning_status")),
                rs.getBoolean("bookmarked"),
                instant(rs, "first_viewed_at"),
                instant(rs, "last_viewed_at"),
                instant(rs, "completed_at"),
                rs.getString("note_content"),
                instant(rs, "note_updated_at"));
    }

    private Instant instant(ResultSet rs, String column) throws SQLException {
        Timestamp timestamp = rs.getTimestamp(column);
        return timestamp == null ? null : timestamp.toInstant();
    }

    public record ConceptFilter(
            String area,
            Long topicId,
            Short level,
            LearningStatus learningStatus,
            Boolean bookmarked,
            String q,
            int page,
            int size,
            ConceptSort sort) {
    }

    public record ConceptPageResult(List<LearningDtos.ConceptListItem> items, LearningDtos.PageMetadata page) {
    }

    public record NavigationRow(LearningDtos.ConceptNavigation concept, boolean previous) {
    }

    public record ConceptHeader(
            long id,
            String contentKey,
            String slug,
            String title,
            String summary,
            String contentMarkdown,
            short level,
            ContentStatus contentStatus,
            int displayOrder,
            long areaId,
            String areaSlug,
            String areaName,
            long topicId,
            String topicSlug,
            String topicTitle,
            LearningStatus learningStatus,
            boolean bookmarked,
            java.time.Instant firstViewedAt,
            java.time.Instant lastViewedAt,
            java.time.Instant completedAt,
            String noteContent,
            java.time.Instant noteUpdatedAt) {
    }
}
