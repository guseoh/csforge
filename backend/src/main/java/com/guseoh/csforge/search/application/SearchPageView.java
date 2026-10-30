package com.guseoh.csforge.search.application;

import java.util.List;

/** 통합 PostgreSQL Search의 page 결과와 처리 시간을 담는 application view이다. */
public record SearchPageView(
        String query,
        int page,
        int size,
        long totalHits,
        int totalPages,
        long tookMillis,
        List<SearchResultItem> items) {
}
