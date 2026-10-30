package com.guseoh.csforge.publiccontent.application;

/** 개인 데이터가 없는 공개 canonical 조회 결과이다. */
public record PublicTopicView(
        long id,
        String slug,
        String title,
        String description,
        long publishedConceptCount,
        long level1Count,
        long level2Count,
        long level3Count) {
}
