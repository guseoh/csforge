package com.guseoh.csforge.review.application;

import java.time.Instant;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.review.domain.ReviewResult;

/**
 * 복습 시도 이력 목록의 단일 항목 애플리케이션 뷰이다.
 */
public record ReviewHistoryItemView(
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
