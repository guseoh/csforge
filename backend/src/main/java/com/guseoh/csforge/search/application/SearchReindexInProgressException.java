package com.guseoh.csforge.search.application;

/** 이미 full reindex가 실행 중이어서 새 요청을 시작할 수 없음을 나타낸다. */
public class SearchReindexInProgressException extends RuntimeException {
    public SearchReindexInProgressException() {
        super("Search reindex is already in progress");
    }
}
