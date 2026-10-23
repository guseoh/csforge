package com.guseoh.csforge.publiccontent.application;

import java.util.List;

/** 개인 데이터가 없는 공개 canonical 조회 결과이다. */
public record PublicAreaDetailView(
        long id,
        String slug,
        String name,
        String description,
        List<PublicTopicView> topics) {
}
