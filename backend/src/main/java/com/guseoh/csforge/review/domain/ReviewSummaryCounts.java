package com.guseoh.csforge.review.domain;

/** 복습 요약 카운트를 단일 집계 쿼리로 전달하는 프로젝션이다. */
public record ReviewSummaryCounts(
        long overdue,
        long dueNow,
        long next24Hours,
        long next7Days,
        long mastered) {
}
