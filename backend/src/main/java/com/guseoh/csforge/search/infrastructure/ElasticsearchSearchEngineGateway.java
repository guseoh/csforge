package com.guseoh.csforge.search.infrastructure;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.SortOrder;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.HighlightField;
import co.elastic.clients.elasticsearch.core.search.Hit;
import co.elastic.clients.util.NamedValue;
import com.guseoh.csforge.search.application.SearchCriteria;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchEngineGateway;
import com.guseoh.csforge.search.application.SearchEngineState;
import com.guseoh.csforge.search.application.SearchPageView;
import com.guseoh.csforge.search.application.SearchResultItem;
import com.guseoh.csforge.search.application.SearchSort;
import com.guseoh.csforge.search.application.SearchSuggestionView;
import org.springframework.stereotype.Component;

/** Elasticsearch 9 Java client로 BM25 Search/suggestion/status를 수행한다. */
@Component
public class ElasticsearchSearchEngineGateway implements SearchEngineGateway {

    private static final String PRE_TAG = "[[H]]";
    private static final String POST_TAG = "[[/H]]";

    private final ElasticsearchClient client;

    public ElasticsearchSearchEngineGateway(ElasticsearchClient client) {
        this.client = client;
    }

    @Override
    public SearchPageView search(SearchCriteria criteria) {
        try {
            SearchRequest request = buildSearchRequest(criteria);
            @SuppressWarnings("unchecked")
            SearchResponse<Map> response = client.search(request, Map.class);
            List<SearchResultItem> items = response.hits().hits().stream().map(this::toResultItem).toList();
            long total = response.hits().total() == null ? items.size() : response.hits().total().value();
            int totalPages = total == 0 ? 0 : Math.toIntExact((total + criteria.size() - 1) / criteria.size());
            return new SearchPageView(criteria.query(), criteria.page(), criteria.size(), total, totalPages, response.took(), items);
        } catch (IOException | RuntimeException exception) {
            throw translate(exception);
        }
    }

    @Override
    public List<SearchSuggestionView> suggest(String query, int size) {
        try {
            Query boolPrefix = Query.of(q -> q.multiMatch(m -> m
                    .query(query)
                    .type(TextQueryType.BoolPrefix)
                    .fields("title.suggest", "title.suggest._2gram", "title.suggest._3gram")));
            SearchRequest request = SearchRequest.of(builder -> builder
                    .index(ElasticsearchSearchProjectionStore.SEARCH_ALIAS)
                    .size(size)
                    .query(boolPrefix)
                    .source(source -> source.filter(filter -> filter.includes(
                            "documentType", "sourceId", "title", "conceptId", "questionId", "referenceUrl"))));
            @SuppressWarnings("unchecked")
            SearchResponse<Map> response = client.search(request, Map.class);
            List<SearchSuggestionView> suggestions = new ArrayList<>();
            java.util.Set<String> seen = new java.util.HashSet<>();
            for (Hit<Map> hit : response.hits().hits()) {
                Map source = hit.source();
                if (source == null) continue;
                String title = stringValue(source.get("title"));
                if (!seen.add(title)) continue;
                suggestions.add(new SearchSuggestionView(
                        SearchDocumentType.valueOf(stringValue(source.get("documentType"))),
                        longValue(source.get("sourceId")),
                        title,
                        nullableLong(source.get("conceptId")),
                        nullableLong(source.get("questionId")),
                        nullableString(source.get("referenceUrl"))));
                if (suggestions.size() >= size) break;
            }
            return List.copyOf(suggestions);
        } catch (IOException | RuntimeException exception) {
            throw translate(exception);
        }
    }

    @Override
    public SearchEngineState state() {
        try {
            return client.indices().exists(request -> request.index(ElasticsearchSearchProjectionStore.SEARCH_ALIAS)).value()
                    ? SearchEngineState.READY
                    : SearchEngineState.NOT_READY;
        } catch (Exception exception) {
            return SearchEngineState.UNAVAILABLE;
        }
    }

    @Override
    public long countDocuments() {
        try {
            return client.count(request -> request.index(ElasticsearchSearchProjectionStore.SEARCH_ALIAS)).count();
        } catch (IOException | RuntimeException exception) {
            throw translate(exception);
        }
    }

    private SearchRequest buildSearchRequest(SearchCriteria criteria) {
        BoolQuery.Builder query = new BoolQuery.Builder();
        query.should(q -> q.term(term -> term.field("documentKey").value(criteria.query()).boost(20.0f)));
        query.should(q -> q.term(term -> term.field("title.raw").value(criteria.query().toLowerCase(java.util.Locale.ROOT)).boost(16.0f)));
        query.should(q -> q.multiMatch(match -> match
                .query(criteria.query())
                .fields(
                        "title^10", "title.standard^8",
                        "summary^5", "summary.standard^4",
                        "areaNames^2", "topicTitles^3",
                        "body^1.5", "body.standard^1.2",
                        "conceptContentKeys^4", "topicContentKeys^3")));
        query.minimumShouldMatch("1");
        addTermsFilter(query, "documentType", criteria.documentTypes().stream().map(Enum::name).toList());
        addTermsFilter(query, "areaSlugs", criteria.areaSlugs());
        addTermsFilter(query, "topicContentKeys", criteria.topicContentKeys());
        if (!criteria.levels().isEmpty()) {
            query.filter(q -> q.terms(terms -> terms.field("levels").terms(values -> values.value(
                    criteria.levels().stream().map(level -> FieldValue.of((long) level)).toList()))));
        }

        SearchRequest.Builder builder = new SearchRequest.Builder()
                .index(ElasticsearchSearchProjectionStore.SEARCH_ALIAS)
                .from(criteria.from())
                .size(criteria.size())
                .trackTotalHits(total -> total.enabled(true))
                .query(query.build()._toQuery())
                .highlight(highlight -> highlight
                        .preTags(PRE_TAG)
                        .postTags(POST_TAG)
                        .fields(NamedValue.of("title", HighlightField.of(field -> field.numberOfFragments(0))))
                        .fields(NamedValue.of("summary", HighlightField.of(field -> field.fragmentSize(160).numberOfFragments(1))))
                        .fields(NamedValue.of("body", HighlightField.of(field -> field.fragmentSize(180).numberOfFragments(1)))));
        applySort(builder, criteria.sort());
        return builder.build();
    }

    private static void addTermsFilter(BoolQuery.Builder query, String field, List<String> values) {
        if (values.isEmpty()) return;
        query.filter(q -> q.terms(terms -> terms.field(field).terms(v -> v.value(values.stream().map(FieldValue::of).toList()))));
    }

    private static void applySort(SearchRequest.Builder builder, SearchSort sort) {
        switch (sort) {
            case RELEVANCE -> {
                builder.sort(s -> s.score(score -> score.order(SortOrder.Desc)));
                builder.sort(s -> s.field(field -> field.field("documentKey").order(SortOrder.Asc)));
            }
            case RECENT -> {
                builder.sort(s -> s.field(field -> field.field("updatedAt").order(SortOrder.Desc)));
                builder.sort(s -> s.field(field -> field.field("documentKey").order(SortOrder.Asc)));
            }
            case TITLE -> {
                builder.sort(s -> s.field(field -> field.field("title.raw").order(SortOrder.Asc)));
                builder.sort(s -> s.field(field -> field.field("documentKey").order(SortOrder.Asc)));
            }
        }
    }

    private SearchResultItem toResultItem(Hit<Map> hit) {
        Map source = hit.source();
        if (source == null) throw new IllegalStateException("Search hit is missing _source");
        String title = stringValue(source.get("title"));
        String highlightedTitle = firstHighlight(hit, "title", title);
        String snippet = firstHighlight(hit, "summary", null);
        if (snippet == null || snippet.isBlank()) snippet = firstHighlight(hit, "body", compact(stringValue(source.get("body")), 180));
        return new SearchResultItem(
                SearchDocumentType.valueOf(stringValue(source.get("documentType"))),
                longValue(source.get("sourceId")),
                title,
                highlightedTitle,
                snippet,
                stringList(source.get("areaSlugs")),
                stringList(source.get("areaNames")),
                stringList(source.get("topicContentKeys")),
                stringList(source.get("topicTitles")),
                integerList(source.get("levels")),
                Instant.parse(stringValue(source.get("updatedAt"))),
                nullableLong(source.get("conceptId")),
                nullableLong(source.get("questionId")),
                nullableString(source.get("referenceUrl")));
    }

    private static String firstHighlight(Hit<Map> hit, String field, String fallback) {
        List<String> values = hit.highlight().get(field);
        return values == null || values.isEmpty() ? fallback : values.getFirst();
    }

    private static String compact(String value, int maxLength) {
        if (value == null) return "";
        String compact = value.replaceAll("\\s+", " ").trim();
        return compact.length() <= maxLength ? compact : compact.substring(0, maxLength - 3) + "...";
    }

    private static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static String nullableString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static long longValue(Object value) {
        if (value instanceof Number number) return number.longValue();
        return Long.parseLong(String.valueOf(value));
    }

    private static Long nullableLong(Object value) {
        return value == null ? null : longValue(value);
    }

    private static List<String> stringList(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        return list.stream().map(String::valueOf).toList();
    }

    private static List<Integer> integerList(Object value) {
        if (!(value instanceof List<?> list)) return List.of();
        return list.stream().map(item -> item instanceof Number number ? number.intValue() : Integer.parseInt(String.valueOf(item))).toList();
    }

    private static RuntimeException translate(Exception exception) {
        return new com.guseoh.csforge.search.application.SearchUnavailableException("Search request failed", exception);
    }
}
