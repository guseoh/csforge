package com.guseoh.csforge.publiccontent.application;

/** 개인 데이터가 없는 공개 canonical 조회 결과이다. */
public record PublicAreaSummaryView(
        long id,
        String slug,
        String name,
        String description,
        long topicCount,
        long publishedConceptCount) {
}
