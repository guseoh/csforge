package com.guseoh.csforge.search.infrastructure;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import com.guseoh.csforge.search.application.SearchCriteria;
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
    private static final String LIKE_ESCAPE = " ESCAPE '\\'";
    private static final String QUESTION_NAVIGATION_JOIN = """
            left join lateral (
                select linked_concept.id as concept_id
                from question_concept question_link
                join concept linked_concept on linked_concept.id = question_link.concept_id
                join topic linked_topic on linked_topic.id = linked_concept.topic_id
                join learning_area linked_area on linked_area.id = linked_topic.learning_area_id
                where question_link.question_id = d.question_id
                  and linked_concept.status = 'PUBLISHED'
                  and linked_topic.active = true
                  and linked_area.active = true
                order by linked_area.display_order, linked_topic.display_order,
                         linked_concept.display_order, linked_concept.id
                limit 1
            ) question_navigation on d.document_type = 'QUESTION'
            """;

    @PersistenceContext
    private EntityManager entityManager;

    private final SearchResultRowMapper resultRowMapper = new SearchResultRowMapper();

    @Override
    @Transactional(readOnly = true)
    public SearchPageView search(SearchCriteria criteria) {
        long startedAt = System.nanoTime();
        List<String> queryTerms = queryTerms(criteria.query());
        long totalHits = count(criteria, queryTerms);
        Query query = createSearchQuery(criteria, queryTerms);
        query.setFirstResult(criteria.from());
        query.setMaxResults(criteria.size());
        List<Object[]> rows = resultRowMapper.rows(query);
        List<SearchResultItem> items = rows.stream().map(row -> resultRowMapper.toResult(row, queryTerms)).toList();
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
                select d.document_type,
                       d.source_id,
                       d.title,
                       case when d.document_type = 'QUESTION' then question_navigation.concept_id else d.concept_id end,
                       d.question_id,
                       d.reference_url
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
                ) d
                """ + QUESTION_NAVIGATION_JOIN + """
                where d.title_rank = 1
                order by d.prefix_rank, length(d.title), lower(d.title), d.document_key
                """)
                .setParameter("prefix", prefix)
                .setParameter("contains", contains)
                .setMaxResults(size);
        return resultRowMapper.rows(suggestionQuery).stream().map(resultRowMapper::toSuggestion).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countSearchableDocuments() {
        return ((Number) entityManager.createNativeQuery("select count(*) from " + SEARCH_VIEW)
                .getSingleResult()).longValue();
    }

    private long count(SearchCriteria criteria, List<String> queryTerms) {
        Query query = createFilteredQuery("select count(*) from " + SEARCH_VIEW, criteria, queryTerms);
        return ((Number) query.getSingleResult()).longValue();
    }

    private Query createSearchQuery(SearchCriteria criteria, List<String> queryTerms) {
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
                       case when d.document_type = 'QUESTION' then question_navigation.concept_id else d.concept_id end,
                       d.question_id,
                       d.reference_url
                from search_document_view d
                """ + QUESTION_NAVIGATION_JOIN;
        StringBuilder builder = new StringBuilder(sql);
        appendSearchFilters(builder, criteria, queryTerms);
        builder.append(" order by ");
        if (criteria.sort() == SearchSort.RELEVANCE) {
            builder.append(relevanceOrder());
        } else if (criteria.sort() == SearchSort.RECENT) {
            builder.append("d.updated_at desc nulls last, d.document_key asc");
        } else {
            builder.append("lower(d.title) asc, d.document_key asc");
        }
        Query query = entityManager.createNativeQuery(builder.toString());
        bindSearchTerms(query, queryTerms);
        bindFilters(query, criteria);
        if (criteria.sort() == SearchSort.RELEVANCE) {
            query.setParameter("pattern", containsPattern(criteria.query()));
            query.setParameter("query", criteria.query());
        }
        return query;
    }

    private Query createFilteredQuery(String select, SearchCriteria criteria, List<String> queryTerms) {
        StringBuilder builder = new StringBuilder(select).append(" d where 1 = 1");
        appendTermFilters(builder, queryTerms);
        appendOptionalFilters(builder, criteria);
        Query query = entityManager.createNativeQuery(builder.toString());
        bindSearchTerms(query, queryTerms);
        bindFilters(query, criteria);
        return query;
    }

    private static void appendSearchFilters(StringBuilder builder, SearchCriteria criteria, List<String> queryTerms) {
        builder.append(" where 1 = 1");
        appendTermFilters(builder, queryTerms);
        appendOptionalFilters(builder, criteria);
    }

    private static void appendTermFilters(StringBuilder builder, List<String> queryTerms) {
        for (int index = 0; index < queryTerms.size(); index++) {
            builder.append(" and d.search_text ilike :termPattern").append(index).append(LIKE_ESCAPE);
        }
    }

    private static void appendOptionalFilters(StringBuilder builder, SearchCriteria criteria) {
        if (!criteria.documentTypes().isEmpty()) builder.append(" and d.document_type in (:documentTypes)");
        if (!criteria.areaSlugs().isEmpty()) builder.append(" and exists (select 1 from unnest(d.area_slugs) value where value in (:areaSlugs))");
        if (!criteria.topicContentKeys().isEmpty()) builder.append(" and exists (select 1 from unnest(d.topic_content_keys) value where value in (:topicContentKeys))");
        if (!criteria.levels().isEmpty()) builder.append(" and exists (select 1 from unnest(d.levels) value where value in (:levels))");
    }

    private static void bindSearchTerms(Query query, List<String> queryTerms) {
        for (int index = 0; index < queryTerms.size(); index++) {
            query.setParameter("termPattern" + index, containsPattern(queryTerms.get(index)));
        }
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

    private static List<String> queryTerms(String query) {
        return Arrays.stream(query.trim().split("\\s+"))
                .filter(term -> !term.isBlank())
                .map(term -> term.toLowerCase(Locale.ROOT))
                .distinct()
                .toList();
    }

    private static String likePattern(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private static String containsPattern(String value) {
        return "%" + likePattern(value) + "%";
    }

}
