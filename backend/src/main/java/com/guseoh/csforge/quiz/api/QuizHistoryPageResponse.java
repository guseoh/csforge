package com.guseoh.csforge.quiz.api;

import java.util.List;

import com.guseoh.csforge.learning.api.PageMetadataResponse;

/**
 * 페이지네이션된 퀴즈 이력 목록 HTTP 응답 모델이다.
 */
public record QuizHistoryPageResponse(
        List<QuizHistoryItemResponse> items,
        PageMetadataResponse page) {
}
