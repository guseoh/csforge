package com.guseoh.csforge.search.infrastructure;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.guseoh.csforge.search.application.SearchCriteria;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchPageView;
import com.guseoh.csforge.search.application.SearchQueryGateway;
import com.guseoh.csforge.search.application.SearchResultItem;
import com.guseoh.csforge.search.application.SearchSort;
import com.guseoh.csforge.search.application.SearchSuggestionView;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/** PostgreSQL 검색 view를 직접 조회해 검색·추천·상태 결과를 제공한다. */
@Repository
public class JpaSearchQueryGateway implements SearchQueryGateway {

    private static final String SEARCH_VIEW = "search_document_view";
    private static final int SNIPPET_LENGTH = 180;
    private static final String LIKE_ESCAPE = " ESCAPE '\\'";
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public SearchPageView search(SearchCriteria criteria) {
        long startedAt = System.nanoTime();
        long totalHits = count(criteria);
        Query query = createSearchQuery(criteria);
        query.setFirstResult(criteria.from());
        query.setMaxResults(criteria.size());
        List<Object[]> rows = rows(query);
        List<SearchResultItem> items = rows.stream().map(row -> toResult(row, criteria.query())).toList();
        int totalPages = totalHits == 0 ? 0 : Math.toIntExact((totalHits + criteria.size() - 1) / criteria.size());
        long tookMillis = (System.nanoTime() - startedAt) / 1_000_000;
        return new SearchPageView(
                criteria.query(), criteria.page(), criteria.size(), totalHits, totalPages, tookMillis, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchSuggestionView> suggest(String query, int size) {
        String normalizedQuery = query.toLowerCase(Locale.ROOT);
        String prefix = likePattern(normalizedQuery) + "%";
        String contains = "%" + likePattern(normalizedQuery) + "%";
        Query suggestionQuery = entityManager.createNativeQuery("""
                select document_type, source_id, title, concept_id, question_id, reference_url
                from (
                    select d.document_type,
                           d.source_id,
                           d.title,
                           d.concept_id,
                           d.question_id,
                           d.reference_url,
                           d.document_key,
                           case when lower(d.title) like :prefix escape '\\' then 0 else 1 end as prefix_rank,
                           row_number() over (
                               partition by lower(d.title)
                               order by case when lower(d.title) like :prefix escape '\\' then 0 else 1 end,
                                        length(d.title),
                                        d.document_key
                           ) as title_rank
                    from search_document_view d
                    where lower(d.title) like :prefix escape '\\'
                       or lower(d.title) like :contains escape '\\'
                ) ranked
                where title_rank = 1
                order by prefix_rank, length(title), lower(title), document_key
                """)
                .setParameter("prefix", prefix)
                .setParameter("contains", contains)
                .setMaxResults(size);
        return rows(suggestionQuery).stream().map(this::toSuggestion).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countSearchableDocuments() {
        return ((Number) entityManager.createNativeQuery("select count(*) from " + SEARCH_VIEW)
                .getSingleResult()).longValue();
    }

    private long count(SearchCriteria criteria) {
        Query query = createFilteredQuery("select count(*) from " + SEARCH_VIEW, criteria);
        return ((Number) query.getSingleResult()).longValue();
    }

    private Query createSearchQuery(SearchCriteria criteria) {
        String sql = """
                select d.document_type,
                       d.source_id,
                       d.title,
                       d.body,
                       d.summary,
                       d.area_slugs,
                       d.area_names,
                       d.topic_content_keys,
                       d.topic_titles,
                       d.levels,
                       d.updated_at,
                       d.concept_id,
                       d.question_id,
                       d.reference_url
                from search_document_view d
                """;
        StringBuilder builder = new StringBuilder(sql);
        appendSearchFilters(builder, criteria);
        builder.append(" order by ");
        if (criteria.sort() == SearchSort.RELEVANCE) {
            builder.append(relevanceOrder());
        } else if (criteria.sort() == SearchSort.RECENT) {
            builder.append("d.updated_at desc nulls last, d.document_key asc");
        } else {
            builder.append("lower(d.title) asc, d.document_key asc");
        }
        Query query = entityManager.createNativeQuery(builder.toString())
                .setParameter("pattern", containsPattern(criteria.query()));
        bindFilters(query, criteria);
        if (criteria.sort() == SearchSort.RELEVANCE) query.setParameter("query", criteria.query());
        return query;
    }

    private Query createFilteredQuery(String select, SearchCriteria criteria) {
        StringBuilder builder = new StringBuilder(select).append(" d where d.search_text ilike :pattern").append(LIKE_ESCAPE);
        appendOptionalFilters(builder, criteria);
        Query query = entityManager.createNativeQuery(builder.toString());
        query.setParameter("pattern", containsPattern(criteria.query()));
        bindFilters(query, criteria);
        return query;
    }

    private static void appendSearchFilters(StringBuilder builder, SearchCriteria criteria) {
        builder.append(" where d.search_text ilike :pattern").append(LIKE_ESCAPE);
        appendOptionalFilters(builder, criteria);
    }

    private static void appendOptionalFilters(StringBuilder builder, SearchCriteria criteria) {
        if (!criteria.documentTypes().isEmpty()) builder.append(" and d.document_type in (:documentTypes)");
        if (!criteria.areaSlugs().isEmpty()) builder.append(" and exists (select 1 from unnest(d.area_slugs) value where value in (:areaSlugs))");
        if (!criteria.topicContentKeys().isEmpty()) builder.append(" and exists (select 1 from unnest(d.topic_content_keys) value where value in (:topicContentKeys))");
        if (!criteria.levels().isEmpty()) builder.append(" and exists (select 1 from unnest(d.levels) value where value in (:levels))");
    }

    private static void bindFilters(Query query, SearchCriteria criteria) {
        if (!criteria.documentTypes().isEmpty()) {
            query.setParameter("documentTypes", criteria.documentTypes().stream().map(Enum::name).toList());
        }
        if (!criteria.areaSlugs().isEmpty()) query.setParameter("areaSlugs", criteria.areaSlugs());
        if (!criteria.topicContentKeys().isEmpty()) query.setParameter("topicContentKeys", criteria.topicContentKeys());
        if (!criteria.levels().isEmpty()) query.setParameter("levels", criteria.levels());
    }

    private static String relevanceOrder() {
        return """
                case
                    when exists (select 1 from unnest(d.content_keys) value where lower(value) = lower(:query)) then 6
                    when lower(d.title) = lower(:query) then 5
                    when d.title ilike :pattern""" + LIKE_ESCAPE + " then 4\n"
                + "                    when coalesce(d.summary, '') ilike :pattern" + LIKE_ESCAPE + " then 3\n"
                + "                    when exists (select 1 from unnest(d.topic_titles || d.area_names) value where value ilike :pattern"
                + LIKE_ESCAPE + ") then 2\n"
                + "                    when d.body ilike :pattern" + LIKE_ESCAPE + " then 1\n"
                + "                    else 0\n"
                + "                end desc, d.document_key asc";
    }

    private SearchResultItem toResult(Object[] row, String query) {
        String title = string(row[2]);
        return new SearchResultItem(
                SearchDocumentType.valueOf(string(row[0])),
                number(row[1]).longValue(),
                title,
                highlightAll(title, query),
                snippet(string(row[4]), string(row[3]), query),
                strings(row[5]),
                strings(row[6]),
                strings(row[7]),
                strings(row[8]),
                integers(row[9]),
                instant(row[10]),
                nullableLong(row[11]),
                nullableLong(row[12]),
                nullableString(row[13]));
    }

    private SearchSuggestionView toSuggestion(Object[] row) {
        return new SearchSuggestionView(
                SearchDocumentType.valueOf(string(row[0])),
                number(row[1]).longValue(),
                string(row[2]),
                nullableLong(row[3]),
                nullableLong(row[4]),
                nullableString(row[5]));
    }

    @SuppressWarnings("unchecked")
    private static List<Object[]> rows(Query query) {
        return (List<Object[]>) query.getResultList();
    }

    private static String snippet(String summary, String body, String query) {
        String source = hasMatch(summary, query) ? summary : hasMatch(body, query) ? body : firstNonBlank(summary, body);
        if (source == null) return "";
        String compact = compactAroundMatch(source, query, SNIPPET_LENGTH);
        return highlightAll(compact, query);
    }

    private static String compactAroundMatch(String value, String query, int maxLength) {
        String compact = WHITESPACE.matcher(value).replaceAll(" ").trim();
        Matcher matcher = pattern(query).matcher(compact);
        if (!matcher.find() || compact.length() <= maxLength) return compact;
        int start = Math.max(0, matcher.start() - 60);
        int end = Math.min(compact.length(), start + maxLength);
        if (end - start < maxLength) start = Math.max(0, end - maxLength);
        return (start > 0 ? "..." : "") + compact.substring(start, end) + (end < compact.length() ? "..." : "");
    }

    private static boolean hasMatch(String value, String query) {
        return value != null && !value.isBlank() && pattern(query).matcher(value).find();
    }

    private static String highlightAll(String value, String query) {
        if (value == null || value.isBlank() || query == null || query.isBlank()) return value == null ? "" : value;
        Matcher matcher = pattern(query).matcher(value);
        StringBuilder highlighted = new StringBuilder();
        int end = 0;
        while (matcher.find()) {
            highlighted.append(value, end, matcher.start())
                    .append("[[H]]")
                    .append(value, matcher.start(), matcher.end())
                    .append("[[/H]]");
            end = matcher.end();
        }
        return end == 0 ? value : highlighted.append(value, end, value.length()).toString();
    }

    private static Pattern pattern(String query) {
        return Pattern.compile(Pattern.quote(query), Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
    }

    private static String likePattern(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private static String containsPattern(String value) {
        return "%" + likePattern(value) + "%";
    }

    private static String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }

    private static String string(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String nullableString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static Number number(Object value) {
        return (Number) Objects.requireNonNull(value, "numeric search column is required");
    }

    private static Long nullableLong(Object value) {
        return value == null ? null : number(value).longValue();
    }

    private static Instant instant(Object value) {
        if (value instanceof Instant instant) return instant;
        if (value instanceof OffsetDateTime dateTime) return dateTime.toInstant();
        if (value instanceof Timestamp timestamp) return timestamp.toInstant();
        return Instant.parse(string(value));
    }

    private static List<String> strings(Object value) {
        Object array = unwrapSqlArray(value);
        if (array instanceof Object[] values) return Arrays.stream(values).filter(Objects::nonNull).map(String::valueOf).toList();
        return array == null ? List.of() : List.of(String.valueOf(array));
    }

    private static List<Integer> integers(Object value) {
        Object array = unwrapSqlArray(value);
        if (array instanceof Object[] values) {
            return Arrays.stream(values).filter(Objects::nonNull).map(item -> ((Number) item).intValue()).toList();
        }
        return array == null ? List.of() : List.of(((Number) array).intValue());
    }

    private static Object unwrapSqlArray(Object value) {
        if (!(value instanceof java.sql.Array sqlArray)) return value;
        try {
            return sqlArray.getArray();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to read PostgreSQL array", exception);
        }
    }
}
