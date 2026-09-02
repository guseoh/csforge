package com.guseoh.csforge.search.application;

/** 사용자에게 노출하는 Search의 준비/장애/재색인 상태이다. */
public enum SearchProductState {
    READY,
    NOT_READY,
    UNAVAILABLE,
    REINDEXING
}
