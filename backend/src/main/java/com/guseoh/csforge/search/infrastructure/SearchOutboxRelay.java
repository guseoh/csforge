package com.guseoh.csforge.search.infrastructure;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchIndexEvent;
import com.guseoh.csforge.search.application.SearchProjectionStore;
import com.guseoh.csforge.search.domain.SearchOutboxEvent;
import com.guseoh.csforge.search.domain.SearchOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** pending Search outbox를 snapshot한 뒤 DB transaction 밖에서 Kafka에 전달하고 최신 행만 상태 갱신한다. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "csforge.search.outbox.relay.enabled", havingValue = "true", matchIfMissing = true)
public class SearchOutboxRelay {

    private static final int BATCH_SIZE = 50;
    private static final long BROKER_ACK_TIMEOUT_SECONDS = 5;
    private static final Duration MAX_BACKOFF = Duration.ofMinutes(5);

    private final SearchOutboxEventRepository repository;
    private final SearchProjectionStore projectionStore;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final SearchIndexEventCodec eventCodec;
    private final Clock clock;
    private final PlatformTransactionManager transactionManager;

    @Scheduled(fixedDelayString = "${csforge.search.outbox-relay-delay-ms:1000}")
    public void relay() {
        if (!projectionStore.isReady()) return;
        Instant attemptedAt = Instant.now(clock);
        for (Dispatch dispatch : snapshotDuePending(attemptedAt)) publish(dispatch, attemptedAt);
    }

    private List<Dispatch> snapshotDuePending(Instant now) {
        TransactionTemplate transaction = transactionTemplate();
        transaction.setReadOnly(true);
        List<Dispatch> dispatches = transaction.execute(status -> repository.findDuePending(now, PageRequest.of(0, BATCH_SIZE)).stream()
                .map(Dispatch::from)
                .toList());
        return dispatches == null ? List.of() : dispatches;
    }

    private void publish(Dispatch dispatch, Instant attemptedAt) {
        try {
            SearchIndexEvent payload = new SearchIndexEvent(
                    SearchIndexEvent.CURRENT_SCHEMA_VERSION,
                    dispatch.eventId(),
                    dispatch.changeType(),
                    dispatch.sourceId(),
                    dispatch.occurredAt());
            String key = dispatch.changeType().name() + ":" + dispatch.sourceId();
            kafkaTemplate.send(SearchKafkaConfiguration.INDEX_TOPIC, key, eventCodec.encode(payload))
                    .get(BROKER_ACK_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            markFailedIfCurrent(dispatch, attemptedAt, exception);
            return;
        } catch (Exception exception) {
            markFailedIfCurrent(dispatch, attemptedAt, exception);
            return;
        }
        markPublishedIfCurrent(dispatch, Instant.now(clock));
    }

    private void markPublishedIfCurrent(Dispatch dispatch, Instant publishedAt) {
        transactionTemplate().executeWithoutResult(status -> repository.findByIdForUpdate(dispatch.id())
                .filter(event -> isCurrentPending(event, dispatch.changeSequence()))
                .ifPresent(event -> event.markPublished(publishedAt)));
    }

    private void markFailedIfCurrent(Dispatch dispatch, Instant attemptedAt, Exception exception) {
        Integer attempt = transactionTemplate().execute(status -> repository.findByIdForUpdate(dispatch.id())
                .filter(event -> isCurrentPending(event, dispatch.changeSequence()))
                .map(event -> {
                    long factor = 1L << Math.min(event.getAttemptCount(), 8);
                    Duration backoff = Duration.ofSeconds(Math.min(MAX_BACKOFF.toSeconds(), factor));
                    event.markFailed(attemptedAt, attemptedAt.plus(backoff), exception.getMessage());
                    return event.getAttemptCount();
                })
                .orElse(null));
        if (attempt != null) {
            log.warn("Search outbox publish failed eventId={} attempt={}", dispatch.eventId(), attempt, exception);
        } else {
            log.debug("Ignored stale Search outbox publish failure eventId={} sequence={}", dispatch.eventId(), dispatch.changeSequence());
        }
    }

    private TransactionTemplate transactionTemplate() {
        return new TransactionTemplate(transactionManager);
    }

    private static boolean isCurrentPending(SearchOutboxEvent event, long expectedChangeSequence) {
        return event.getPublishedAt() == null && event.getChangeSequence() == expectedChangeSequence;
    }

    private record Dispatch(
            long id,
            UUID eventId,
            SearchChangeType changeType,
            long sourceId,
            long changeSequence,
            Instant occurredAt) {

        static Dispatch from(SearchOutboxEvent event) {
            return new Dispatch(
                    event.getId(),
                    event.getEventId(),
                    event.getChangeType(),
                    event.getSourceId(),
                    event.getChangeSequence(),
                    event.getUpdatedAt());
        }
    }
}
