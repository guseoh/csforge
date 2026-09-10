package com.guseoh.csforge.search.application;

import java.util.List;

/** Search 사용 사례가 PostgreSQL 조회 구현에 접근하는 persistence 경계이다. */
public interface SearchQueryGateway {

    SearchPageView search(SearchCriteria criteria);

    List<SearchSuggestionView> suggest(String query, int size);

    long countSearchableDocuments();
}
