package com.guseoh.csforge.search.infrastructure;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Search outbox relay와 index consumer가 사용하는 Kafka topic 및 scheduling을 설정한다. */
@Configuration
@EnableKafka
@EnableScheduling
public class SearchKafkaConfiguration {

    public static final String INDEX_TOPIC = "csforge.search-index.v1";
    public static final String INDEX_DLT_TOPIC = "csforge.search-index.v1.DLT";

    @Bean
    NewTopic searchIndexTopic() {
        return TopicBuilder.name(INDEX_TOPIC).partitions(1).replicas(1).build();
    }

    @Bean
    NewTopic searchIndexDeadLetterTopic() {
        return TopicBuilder.name(INDEX_DLT_TOPIC).partitions(1).replicas(1).build();
    }
}
