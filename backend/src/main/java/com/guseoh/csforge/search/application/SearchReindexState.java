package com.guseoh.csforge.search.application;

/** Search query/status가 reindex 진행 여부를 조회하는 작은 상태 경계이다. */
public interface SearchReindexState {
    boolean isReindexing();
}
