package com.guseoh.csforge.search.infrastructure;

/** Elasticsearch projection write가 완료되지 않아 Kafka retry가 필요한 실패이다. */
public class SearchProjectionWriteException extends RuntimeException {
    public SearchProjectionWriteException(String message, Throwable cause) {
        super(message, cause);
    }
}
