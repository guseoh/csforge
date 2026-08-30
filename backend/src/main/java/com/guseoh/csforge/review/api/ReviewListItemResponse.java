package com.guseoh.csforge.review.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 복습 일정 목록 항목의 HTTP 응답이다.
 */
public record ReviewListItemResponse(long questionId, String promptMarkdown, QuestionType questionType, QuestionDifficulty difficulty,
        List<ReviewConceptResponse> concepts, ReviewScheduleStatus status, short stage, Instant dueAt, Instant lastReviewedAt) {
}
