package com.guseoh.csforge.review.api;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.learning.api.PageMetadataResponse;
import com.guseoh.csforge.review.application.ReviewListItemView;
import com.guseoh.csforge.review.application.ReviewPageView;
import com.guseoh.csforge.review.application.ReviewScheduledView;
import com.guseoh.csforge.review.application.ReviewSummaryView;
import com.guseoh.csforge.quiz.application.QuizCreatedResult;

/**
 * 복습 애플리케이션 모델을 HTTP 응답으로 변환하는 mapper이다.
 */
@Component
public class ReviewApiMapper {

    public ReviewSummaryResponse toResponse(ReviewSummaryView view) {
        return new ReviewSummaryResponse(view.overdue(), view.dueNow(), view.next24Hours(), view.next7Days(), view.mastered());
    }

    public ReviewListResponse toResponse(ReviewPageView view) {
        return new ReviewListResponse(view.items().stream().map(this::toItem).toList(),
                new PageMetadataResponse(view.page(), view.size(), view.totalElements(), (int) Math.ceil((double) view.totalElements() / view.size()),
                        (view.page() + 1L) * view.size() < view.totalElements(), view.page() > 0));
    }

    public ReviewScheduledResponse toResponse(ReviewScheduledView view) {
        return new ReviewScheduledResponse(view.questionId(), view.status(), view.stage(), view.dueAt());
    }

    public ReviewQuizCreatedResponse toResponse(QuizCreatedResult result) {
        return new ReviewQuizCreatedResponse(result.quizId(), result.status(), result.questionCount(), result.startedAt(), result.expiresAt(), result.lastPosition(), result.source());
    }

    private ReviewListItemResponse toItem(ReviewListItemView item) {
        return new ReviewListItemResponse(item.questionId(), item.promptMarkdown(), item.questionType(), item.difficulty(),
                item.concepts().stream().map(concept -> new ReviewConceptResponse(concept.id(), concept.slug(), concept.title(), concept.areaSlug(), concept.areaName(), concept.level())).toList(),
                item.status(), item.stage(), item.dueAt(), item.lastReviewedAt());
    }
}
