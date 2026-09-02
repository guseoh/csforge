package com.guseoh.csforge.search.infrastructure;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.guseoh.csforge.search.application.SearchIndexEvent;
import com.guseoh.csforge.search.application.SearchProjectionStore;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** pending Search outbox 행을 bounded batch로 Kafka에 전달하고 broker ack 이후 발행 완료로 표시한다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class SearchOutboxRelay {

    private static final int BATCH_SIZE = 50;
    private static final long BROKER_ACK_TIMEOUT_SECONDS = 5;
    private static final Duration MAX_BACKOFF = Duration.ofMinutes(5);

    private final SearchOutboxEventRepository repository;
    private final SearchProjectionStore projectionStore;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    @Scheduled(fixedDelayString = "${csforge.search.outbox-relay-delay-ms:1000}")
    @Transactional
    public void relay() {
        if (!projectionStore.isReady()) return;
        Instant now = Instant.now(clock);
        List<SearchOutboxEvent> events = repository.findDuePending(now, PageRequest.of(0, BATCH_SIZE));
        for (SearchOutboxEvent event : events) publish(event, now);
    }

    private void publish(SearchOutboxEvent event, Instant attemptedAt) {
        try {
            SearchIndexEvent payload = new SearchIndexEvent(
                    SearchIndexEvent.CURRENT_SCHEMA_VERSION,
                    event.getEventId(),
                    event.getChangeType(),
                    event.getSourceId(),
                    event.getUpdatedAt());
            String json = objectMapper.writeValueAsString(payload);
            String key = event.getChangeType().name() + ":" + event.getSourceId();
            kafkaTemplate.send(SearchKafkaConfiguration.INDEX_TOPIC, key, json)
                    .get(BROKER_ACK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            event.markPublished(Instant.now(clock));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            markFailed(event, attemptedAt, exception);
        } catch (JsonProcessingException exception) {
            markFailed(event, attemptedAt, exception);
        } catch (Exception exception) {
            markFailed(event, attemptedAt, exception);
        }
    }

    private void markFailed(SearchOutboxEvent event, Instant attemptedAt, Exception exception) {
        long factor = 1L << Math.min(event.getAttemptCount(), 8);
        Duration backoff = Duration.ofSeconds(Math.min(MAX_BACKOFF.toSeconds(), factor));
        event.markFailed(attemptedAt, attemptedAt.plus(backoff), exception.getMessage());
        log.warn("Search outbox publish failed eventId={} attempt={}", event.getEventId(), event.getAttemptCount(), exception);
    }
}
