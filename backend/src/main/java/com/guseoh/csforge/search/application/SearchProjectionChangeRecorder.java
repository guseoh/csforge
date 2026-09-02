package com.guseoh.csforge.search.application;

/** canonical/personal 변경과 같은 transaction에서 검색 outbox 변경을 기록하는 경계이다. */
public interface SearchProjectionChangeRecorder {
    void record(SearchChangeType changeType, long sourceId);
}
