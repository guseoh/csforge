package com.guseoh.csforge.review.api;

import java.time.Instant;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.review.domain.ReviewResult;

/**
 * 복습 이력 목록의 단일 항목 HTTP 응답 모델이다.
 */
public record ReviewHistoryItemResponse(
        long historyId,
        long questionId,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        long quizId,
        ReviewResult result,
        int stageBefore,
        Integer stageAfter,
        Instant reviewedAt,
        Instant nextDueAt) {
}
