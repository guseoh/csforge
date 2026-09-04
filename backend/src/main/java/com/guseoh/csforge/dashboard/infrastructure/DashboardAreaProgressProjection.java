package com.guseoh.csforge.dashboard.infrastructure;

/** 활성 학습 영역의 전체·완료 개념 수를 전달하는 persistence projection이다. */
public record DashboardAreaProgressProjection(
        String areaSlug,
        String areaName,
        long completedConceptCount,
        long publishedConceptCount,
        long level1Total,
        long level1Completed,
        long level2Total,
        long level2Completed,
        long level3Total,
        long level3Completed) {
}
