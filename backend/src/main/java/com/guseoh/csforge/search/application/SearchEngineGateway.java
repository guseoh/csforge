package com.guseoh.csforge.search.application;

import java.util.List;

/** Search query/suggestion/status를 Elasticsearch에 위임하는 application 외부 경계이다. */
public interface SearchEngineGateway {
    SearchPageView search(SearchCriteria criteria);
    List<SearchSuggestionView> suggest(String query, int size);
    SearchEngineState state();
    long countDocuments();
}
