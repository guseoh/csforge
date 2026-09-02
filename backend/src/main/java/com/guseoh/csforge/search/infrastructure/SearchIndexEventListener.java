package com.guseoh.csforge.search.infrastructure;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.guseoh.csforge.search.application.SearchIndexEvent;
import com.guseoh.csforge.search.application.SearchProjectionIndexer;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/** Kafka Search 이벤트를 역직렬화하고 idempotent projection indexer에 위임한다. */
@Component
@RequiredArgsConstructor
public class SearchIndexEventListener {

    public static final String LISTENER_ID = "searchIndexListener";

    private final ObjectMapper objectMapper;
    private final SearchProjectionIndexer indexer;

    @KafkaListener(
            id = LISTENER_ID,
            topics = SearchKafkaConfiguration.INDEX_TOPIC,
            groupId = "csforge-search-indexer-v1")
    public void onMessage(String payload) throws Exception {
        SearchIndexEvent event = objectMapper.readValue(payload, SearchIndexEvent.class);
        if (event.schemaVersion() != SearchIndexEvent.CURRENT_SCHEMA_VERSION) {
            throw new IllegalArgumentException("Unsupported search event schema version: " + event.schemaVersion());
        }
        indexer.apply(event);
    }
}
