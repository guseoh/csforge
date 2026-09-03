package com.guseoh.csforge.search.application;

/** full reindex가 PostgreSQL Search source를 stable keyset batch로 읽는 경계이다. */
public interface SearchProjectionBatchLoader {
    SearchProjectionBatch loadAfter(SearchDocumentType documentType, long afterSourceId, int limit);
}
