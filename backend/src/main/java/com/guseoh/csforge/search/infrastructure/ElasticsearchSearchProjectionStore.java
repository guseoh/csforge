package com.guseoh.csforge.search.infrastructure;

import java.io.IOException;
import java.util.Map;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch.core.IndexRequest;
import com.guseoh.csforge.search.application.SearchDocumentRef;
import com.guseoh.csforge.search.application.SearchProjectionDocument;
import com.guseoh.csforge.search.application.SearchProjectionStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** stable alias를 통해 Elasticsearch derived 검색 문서를 idempotent하게 저장/삭제한다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class ElasticsearchSearchProjectionStore implements SearchProjectionStore {

    public static final String SEARCH_ALIAS = "csforge-search";

    private final ElasticsearchClient client;

    @Override
    public boolean isReady() {
        try {
            return client.indices().exists(request -> request.index(SEARCH_ALIAS)).value();
        } catch (IOException | ElasticsearchException exception) {
            log.debug("Search alias readiness check failed", exception);
            return false;
        }
    }

    @Override
    public void upsert(SearchProjectionDocument document) {
        Map<String, Object> source = document.toSource();
        IndexRequest<Map<String, Object>> request = IndexRequest.of(builder -> builder
                .index(SEARCH_ALIAS)
                .id(document.ref().documentKey())
                .document(source));
        try {
            client.index(request);
        } catch (IOException | ElasticsearchException exception) {
            throw new SearchProjectionWriteException("Failed to index " + document.ref().documentKey(), exception);
        }
    }

    @Override
    public void delete(SearchDocumentRef ref) {
        try {
            if (!client.exists(request -> request.index(SEARCH_ALIAS).id(ref.documentKey())).value()) return;
            client.delete(request -> request.index(SEARCH_ALIAS).id(ref.documentKey()));
        } catch (IOException | ElasticsearchException exception) {
            throw new SearchProjectionWriteException("Failed to delete " + ref.documentKey(), exception);
        }
    }
}
