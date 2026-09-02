package com.guseoh.csforge.search.application;

/** full reindex cutover 동안 Search Kafka consumer를 quiesce하고 복구하는 경계이다. */
public interface SearchIndexListenerControl {
    boolean pauseAndAwait();
    void resume();
}
