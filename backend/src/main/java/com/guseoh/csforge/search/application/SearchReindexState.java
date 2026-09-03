package com.guseoh.csforge.search.application;

/** single-process V1의 reindex 중복 실행 방지와 product status 공유 경계이다. */
public interface SearchReindexState {
    boolean isReindexing();
    boolean tryStart();
    void finish();
}
