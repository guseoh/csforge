package com.guseoh.csforge.learning.application;

import java.util.List;

/** 영역 목차 페이지와 다음 페이지 탐색 정보를 전달한다. */
public record LearningAreaOutlinePageView(
        List<LearningAreaOutlineConceptView> items,
        PageMetadataView page) {
}
