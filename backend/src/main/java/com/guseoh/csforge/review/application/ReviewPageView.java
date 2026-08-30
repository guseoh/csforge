package com.guseoh.csforge.review.application;

import java.util.List;

/**
 * bounded 복습 일정 목록과 페이지 정보를 전달하는 조회 모델이다.
 */
public record ReviewPageView(List<ReviewListItemView> items, long totalElements, int page, int size) {
}
