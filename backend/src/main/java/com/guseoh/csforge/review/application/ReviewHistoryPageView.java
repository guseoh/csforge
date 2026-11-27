package com.guseoh.csforge.review.application;

import java.util.List;

/**
 * 페이지네이션된 복습 이력 조회 결과의 애플리케이션 뷰이다.
 */
public record ReviewHistoryPageView(
        List<ReviewHistoryItemView> items,
        long totalElements,
        int page,
        int size) {
}
