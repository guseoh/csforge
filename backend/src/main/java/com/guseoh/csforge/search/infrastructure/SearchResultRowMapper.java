package com.guseoh.csforge.search.infrastructure;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchResultItem;
import com.guseoh.csforge.search.application.SearchSuggestionView;
import jakarta.persistence.Query;

/** PostgreSQL 검색 결과 행을 application 검색 view로 변환한다. */
final class SearchResultRowMapper {

    private final SearchResultHighlighter highlighter = new SearchResultHighlighter();

    SearchResultItem toResult(Object[] row, List<String> queryTerms) {
        String title = string(row[2]);
        return new SearchResultItem(
                SearchDocumentType.valueOf(string(row[0])),
                number(row[1]).longValue(),
                title,
                highlighter.highlightAll(title, queryTerms),
                highlighter.snippet(string(row[4]), string(row[3]), queryTerms),
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

    SearchSuggestionView toSuggestion(Object[] row) {
        return new SearchSuggestionView(
                SearchDocumentType.valueOf(string(row[0])),
                number(row[1]).longValue(),
                string(row[2]),
                nullableLong(row[3]),
                nullableLong(row[4]),
                nullableString(row[5]));
    }

    @SuppressWarnings("unchecked")
    List<Object[]> rows(Query query) {
        return (List<Object[]>) query.getResultList();
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
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof OffsetDateTime dateTime) {
            return dateTime.toInstant();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant();
        }
        return Instant.parse(string(value));
    }

    private static List<String> strings(Object value) {
        Object array = unwrapSqlArray(value);
        if (array instanceof Object[] values) {
            return Arrays.stream(values).filter(Objects::nonNull).map(String::valueOf).toList();
        }
        return array == null ? List.of() : List.of(String.valueOf(array));
    }

    private static List<Integer> integers(Object value) {
        Object array = unwrapSqlArray(value);
        if (array instanceof Object[] values) {
            return Arrays.stream(values)
                    .filter(Objects::nonNull)
                    .map(item -> ((Number) item).intValue())
                    .toList();
        }
        return array == null ? List.of() : List.of(((Number) array).intValue());
    }

    private static Object unwrapSqlArray(Object value) {
        if (!(value instanceof java.sql.Array sqlArray)) {
            return value;
        }
        try {
            return sqlArray.getArray();
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to read PostgreSQL array", exception);
        }
    }
}
