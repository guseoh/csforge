package com.guseoh.csforge.search.application;

/** derived Elasticsearch projection의 idempotent write/delete 경계이다. */
public interface SearchProjectionStore {
    boolean isReady();
    void upsert(SearchProjectionDocument document);
    void delete(SearchDocumentRef ref);
}
