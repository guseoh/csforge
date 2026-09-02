package com.guseoh.csforge.search.api;

import java.util.Map;

import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchReindexResult;

/** full reindex 완료 후 실제 Elasticsearch 문서 수를 반환한다. */
public record SearchReindexResponse(
        long totalIndexedCount,
        Map<SearchDocumentType, Long> indexedCounts) {

    public static SearchReindexResponse from(SearchReindexResult result) {
        return new SearchReindexResponse(result.totalIndexedCount(), result.indexedCounts());
    }
}
