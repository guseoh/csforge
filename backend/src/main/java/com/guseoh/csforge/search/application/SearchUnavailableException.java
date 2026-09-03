package com.guseoh.csforge.search.application;

/** Elasticsearch 연결 장애로 Search query를 수행할 수 없음을 나타낸다. */
public class SearchUnavailableException extends RuntimeException {
    public SearchUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }

    public SearchUnavailableException(String message) {
        super(message);
    }
}
