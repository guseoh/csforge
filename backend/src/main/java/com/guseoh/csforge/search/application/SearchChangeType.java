package com.guseoh.csforge.search.application;

/** 검색 projection 재계산이 필요한 PostgreSQL source 종류이다. */
public enum SearchChangeType {
    TOPIC,
    CONCEPT,
    QUESTION,
    PERSONAL_NOTE,
    WRONG_NOTE,
    REFERENCE
}
