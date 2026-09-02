package com.guseoh.csforge.search.infrastructure;

import java.io.IOException;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Elasticsearch 연결을 실제 Search 사용 시점까지 지연시키고 client 수명을 관리한다. */
@Component
public class SearchElasticsearchClientProvider {

    private final String endpoint;
    private volatile ElasticsearchClient client;

    public SearchElasticsearchClientProvider(
            @Value("${spring.elasticsearch.uris:http://localhost:9200}") String configuredUris) {
        this.endpoint = firstEndpoint(configuredUris);
    }

    public ElasticsearchClient client() {
        ElasticsearchClient current = client;
        if (current != null) return current;
        synchronized (this) {
            if (client == null) client = ElasticsearchClient.of(builder -> builder.host(endpoint));
            return client;
        }
    }

    @PreDestroy
    void close() throws IOException {
        ElasticsearchClient current = client;
        if (current != null) current.close();
    }

    private static String firstEndpoint(String configuredUris) {
        if (configuredUris == null || configuredUris.isBlank()) return "http://localhost:9200";
        String endpoint = configuredUris.split(",", 2)[0].trim();
        if (endpoint.isBlank()) throw new IllegalArgumentException("Elasticsearch URI must not be blank");
        return endpoint;
    }
}
