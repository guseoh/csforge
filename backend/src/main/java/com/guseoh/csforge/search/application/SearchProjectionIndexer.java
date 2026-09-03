package com.guseoh.csforge.search.application;

/** 최신 PostgreSQL 상태를 Elasticsearch 검색 projection으로 수렴시키는 경계이다. */
public interface SearchProjectionIndexer {
    void apply(SearchIndexEvent event);
}
