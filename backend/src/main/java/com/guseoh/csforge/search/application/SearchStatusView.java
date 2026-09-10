package com.guseoh.csforge.search.application;

/** PostgreSQL에서 현재 검색 가능한 문서 수를 담는 application view이다. */
public record SearchStatusView(long searchableDocuments) {
}
