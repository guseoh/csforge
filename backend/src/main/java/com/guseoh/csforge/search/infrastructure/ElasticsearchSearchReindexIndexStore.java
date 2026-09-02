package com.guseoh.csforge.search.infrastructure;

import java.io.IOException;
import java.io.InputStream;
import java.time.Clock;
import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.indices.CreateIndexRequest;
import com.guseoh.csforge.search.application.SearchDocumentRef;
import com.guseoh.csforge.search.application.SearchDocumentType;
import com.guseoh.csforge.search.application.SearchProjectionDocument;
import com.guseoh.csforge.search.application.SearchReindexIndexStore;
import com.guseoh.csforge.search.application.SearchUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/** versioned physical Elasticsearch index를 만들고 bulk build 및 atomic alias swap을 수행한다. */
@Component
@RequiredArgsConstructor
public class ElasticsearchSearchReindexIndexStore implements SearchReindexIndexStore {

    private static final String INDEX_PREFIX = "csforge-search-v1-";
    private static final String INDEX_PATTERN = INDEX_PREFIX + "*";
    private static final String INDEX_DEFINITION = "search/index-v1.json";

    private final SearchElasticsearchClientProvider clientProvider;
    private final Clock clock;

    @Override
    public String createPhysicalIndex() {
        String indexName = newIndexName();
        ClassPathResource resource = new ClassPathResource(INDEX_DEFINITION);
        try (InputStream input = resource.getInputStream()) {
            CreateIndexRequest request = new CreateIndexRequest.Builder()
                    .index(indexName)
                    .withJson(input)
                    .build();
            clientProvider.client().indices().create(request);
            return indexName;
        } catch (IOException | RuntimeException exception) {
            throw new SearchUnavailableException("Failed to create Search reindex target", exception);
        }
    }

    @Override
    public void bulkUpsert(String indexName, List<SearchProjectionDocument> documents) {
        if (documents.isEmpty()) return;
        BulkRequest.Builder request = new BulkRequest.Builder();
        for (SearchProjectionDocument document : documents) {
            request.operations(operation -> operation.index(index -> index
                    .index(indexName)
                    .id(document.ref().documentKey())
                    .document(document.toSource())));
        }
        try {
            BulkResponse response = clientProvider.client().bulk(request.build());
            if (response.errors()) {
                String failures = response.items().stream()
                        .filter(item -> item.error() != null)
                        .limit(5)
                        .map(item -> item.id() + ": " + item.error().reason())
                        .collect(Collectors.joining("; "));
                throw new SearchProjectionWriteException(
                        "Search reindex bulk write failed: " + failures,
                        new IllegalStateException(failures));
            }
        } catch (IOException exception) {
            throw new SearchProjectionWriteException("Search reindex bulk write failed", exception);
        } catch (RuntimeException exception) {
            if (exception instanceof SearchProjectionWriteException writeException) throw writeException;
            throw new SearchProjectionWriteException("Search reindex bulk write failed", exception);
        }
    }

    @Override
    public void upsert(String indexName, SearchProjectionDocument document) {
        try {
            clientProvider.client().index(request -> request
                    .index(indexName)
                    .id(document.ref().documentKey())
                    .document(document.toSource()));
        } catch (IOException | RuntimeException exception) {
            throw new SearchProjectionWriteException("Failed to reindex " + document.ref().documentKey(), exception);
        }
    }

    @Override
    public void delete(String indexName, SearchDocumentRef ref) {
        try {
            clientProvider.client().delete(request -> request.index(indexName).id(ref.documentKey()));
        } catch (IOException | RuntimeException exception) {
            throw new SearchProjectionWriteException("Failed to delete reindex projection " + ref.documentKey(), exception);
        }
    }

    @Override
    public Map<SearchDocumentType, Long> countByDocumentType(String indexName) {
        Map<SearchDocumentType, Long> counts = new EnumMap<>(SearchDocumentType.class);
        try {
            for (SearchDocumentType type : SearchDocumentType.values()) {
                long count = clientProvider.client().count(request -> request
                        .index(indexName)
                        .query(query -> query.term(term -> term.field("documentType").value(type.name()))))
                        .count();
                counts.put(type, count);
            }
            return Map.copyOf(counts);
        } catch (IOException | RuntimeException exception) {
            throw new SearchUnavailableException("Failed to count rebuilt Search documents", exception);
        }
    }

    @Override
    public void swapAlias(String indexName) {
        try {
            clientProvider.client().indices().updateAliases(request -> request
                    .actions(action -> action.remove(remove -> remove
                            .index(INDEX_PATTERN)
                            .alias(ElasticsearchSearchProjectionStore.SEARCH_ALIAS)
                            .mustExist(false)))
                    .actions(action -> action.add(add -> add
                            .index(indexName)
                            .alias(ElasticsearchSearchProjectionStore.SEARCH_ALIAS))));
        } catch (IOException | RuntimeException exception) {
            throw new SearchUnavailableException("Failed to atomically swap Search alias", exception);
        }
    }

    @Override
    public void deleteIndex(String indexName) {
        try {
            clientProvider.client().indices().delete(request -> request.index(indexName));
        } catch (IOException | RuntimeException exception) {
            throw new SearchUnavailableException("Failed to delete Search physical index " + indexName, exception);
        }
    }

    private String newIndexName() {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return INDEX_PREFIX + Instant.now(clock).toEpochMilli() + "-" + suffix;
    }
}
