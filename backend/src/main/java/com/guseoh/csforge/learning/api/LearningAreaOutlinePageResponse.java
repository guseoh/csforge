package com.guseoh.csforge.learning.api;

import java.util.List;

/** 영역 학습 목차와 bounded pagination 정보를 반환한다. */
public record LearningAreaOutlinePageResponse(
        List<LearningAreaOutlineConceptResponse> items,
        PageMetadataResponse page) {
}
