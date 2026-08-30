package com.guseoh.csforge.review.api;

import java.util.List;

import com.guseoh.csforge.learning.api.PageMetadataResponse;

/**
 * 복습 일정 목록의 HTTP 응답이다.
 */
public record ReviewListResponse(List<ReviewListItemResponse> items, PageMetadataResponse page) {
}
