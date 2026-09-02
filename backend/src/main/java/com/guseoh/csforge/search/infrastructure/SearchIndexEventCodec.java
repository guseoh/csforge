package com.guseoh.csforge.search.infrastructure;

import java.time.Instant;
import java.util.UUID;

import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchIndexEvent;
import org.springframework.stereotype.Component;

/** Search Kafka 내부 메시지를 의존성 없는 고정 필드 문자열 형식으로 직렬화한다. */
@Component
public class SearchIndexEventCodec {

    private static final String DELIMITER = "|";

    public String encode(SearchIndexEvent event) {
        return event.schemaVersion()
                + DELIMITER + event.eventId()
                + DELIMITER + event.changeType().name()
                + DELIMITER + event.sourceId()
                + DELIMITER + event.occurredAt().toEpochMilli();
    }

    public SearchIndexEvent decode(String payload) {
        String[] parts = payload.split("\\|", -1);
        if (parts.length != 5) throw new IllegalArgumentException("Invalid search event payload");
        try {
            return new SearchIndexEvent(
                    Integer.parseInt(parts[0]),
                    UUID.fromString(parts[1]),
                    SearchChangeType.valueOf(parts[2]),
                    Long.parseLong(parts[3]),
                    Instant.ofEpochMilli(Long.parseLong(parts[4])));
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Invalid search event payload", exception);
        }
    }
}
