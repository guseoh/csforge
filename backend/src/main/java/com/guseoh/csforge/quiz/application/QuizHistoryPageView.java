package com.guseoh.csforge.quiz.application;

import java.util.List;

/**
 * 페이지네이션된 퀴즈 이력 조회 결과의 애플리케이션 뷰이다.
 */
public record QuizHistoryPageView(
        List<QuizHistoryItemView> items,
        long totalElements,
        int page,
        int size) {
}
