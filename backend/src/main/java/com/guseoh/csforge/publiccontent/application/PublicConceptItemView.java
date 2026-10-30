package com.guseoh.csforge.publiccontent.application;

/** 개인 데이터가 없는 공개 canonical 조회 결과이다. */
public record PublicConceptItemView(
        long id,
        String areaSlug,
        String areaName,
        long topicId,
        String topicSlug,
        String topicTitle,
        String title,
        String summary,
        short level) {
}
