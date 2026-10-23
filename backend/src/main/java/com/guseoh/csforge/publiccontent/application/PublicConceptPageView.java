package com.guseoh.csforge.publiccontent.application;

import com.guseoh.csforge.learning.application.PageMetadataView;
import java.util.List;

/** 개인 데이터가 없는 공개 canonical 조회 결과이다. */
public record PublicConceptPageView(
        List<PublicConceptItemView> items,
        PageMetadataView page) {
}
