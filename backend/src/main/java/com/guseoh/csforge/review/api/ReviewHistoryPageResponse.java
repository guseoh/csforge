package com.guseoh.csforge.review.api;

import java.util.List;

import com.guseoh.csforge.learning.api.PageMetadataResponse;

/**
 * 페이지네이션된 복습 이력 목록 HTTP 응답 모델이다.
 */
public record ReviewHistoryPageResponse(
        List<ReviewHistoryItemResponse> items,
        PageMetadataResponse page) {
}
