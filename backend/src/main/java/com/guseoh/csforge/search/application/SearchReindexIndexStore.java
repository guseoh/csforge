package com.guseoh.csforge.search.application;

import java.util.List;
import java.util.Map;

/** full reindex 전용 physical Elasticsearch index lifecycle과 write 경계이다. */
public interface SearchReindexIndexStore {
    String createPhysicalIndex();
    void bulkUpsert(String indexName, List<SearchProjectionDocument> documents);
    void upsert(String indexName, SearchProjectionDocument document);
    void delete(String indexName, SearchDocumentRef ref);
    void refresh(String indexName);
    Map<SearchDocumentType, Long> countByDocumentType(String indexName);
    void swapAlias(String indexName);
    void deleteIndex(String indexName);
}
