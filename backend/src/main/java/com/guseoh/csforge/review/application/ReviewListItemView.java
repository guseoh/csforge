package com.guseoh.csforge.review.application;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 복습 일정 목록 한 행의 애플리케이션 조회 모델이다.
 */
public record ReviewListItemView(
        long questionId,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        List<ConceptView> concepts,
        ReviewScheduleStatus status,
        short stage,
        Instant dueAt,
        Instant lastReviewedAt) {

    /**
     * 목록에 표시할 Concept 요약이다.
     */
    public record ConceptView(long id, String slug, String title, String areaSlug, String areaName, short level) {
    }
}
