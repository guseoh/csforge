package com.guseoh.csforge.search.infrastructure;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.util.backoff.FixedBackOff;

/** Search outbox relay와 index consumer가 사용하는 Kafka topic 및 failure recovery를 설정한다. */
@Configuration
@EnableScheduling
public class SearchKafkaConfiguration {

    public static final String INDEX_TOPIC = "csforge.search-index.v1";
    public static final String INDEX_DLT_TOPIC = "csforge.search-index.v1.DLT";

    private static final long INDEX_RETRY_BACKOFF_MS = 1_000L;
    private static final long INDEX_RETRY_ATTEMPTS = 4L;

    @Bean
    NewTopic searchIndexTopic() {
        return TopicBuilder.name(INDEX_TOPIC).partitions(1).replicas(1).build();
    }

    @Bean
    NewTopic searchIndexDeadLetterTopic() {
        return TopicBuilder.name(INDEX_DLT_TOPIC).partitions(1).replicas(1).build();
    }

    @Bean
    @ConditionalOnProperty(
            name = "csforge.search.kafka.error-handler.enabled",
            havingValue = "true",
            matchIfMissing = true)
    DefaultErrorHandler searchKafkaErrorHandler(KafkaTemplate<String, String> kafkaTemplate) {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
                kafkaTemplate,
                (record, exception) -> new TopicPartition(INDEX_DLT_TOPIC, record.partition()));
        recoverer.setFailIfSendResultIsError(true);

        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                recoverer,
                new FixedBackOff(INDEX_RETRY_BACKOFF_MS, INDEX_RETRY_ATTEMPTS));
        errorHandler.addNotRetryableExceptions(IllegalArgumentException.class);
        return errorHandler;
    }
}
