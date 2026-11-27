package com.guseoh.csforge.review.application;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.review.domain.ReviewHistory;
import com.guseoh.csforge.review.domain.ReviewHistoryRepository;

/**
 * 복습 시도 이력을 페이지 단위로 조회하는 애플리케이션 서비스이다.
 */
@Service
@RequiredArgsConstructor
public class ReviewHistoryQueryService {

    private final ReviewHistoryRepository historyRepository;

    @Transactional(readOnly = true)
    public ReviewHistoryPageView history(Long questionId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<ReviewHistory> result = questionId == null
                ? historyRepository.findAllByOrderByReviewedAtDescIdDesc(pageable)
                : historyRepository.findByQuestion_IdOrderByReviewedAtDescIdDesc(questionId, pageable);
        List<ReviewHistoryItemView> items = result.getContent().stream()
                .map(ReviewHistoryQueryService::toItem)
                .toList();
        return new ReviewHistoryPageView(items, result.getTotalElements(), page, size);
    }

    private static ReviewHistoryItemView toItem(ReviewHistory history) {
        var question = history.getQuestion();
        return new ReviewHistoryItemView(
                history.getId(),
                question.getId(),
                question.getPromptMarkdown(),
                question.getQuestionType(),
                question.getDifficulty(),
                history.getQuizSession().getId(),
                history.getResult(),
                history.getStageBefore(),
                history.getStageAfter() == null ? null : history.getStageAfter().intValue(),
                history.getReviewedAt(),
                history.getNextDueAt());
    }
}
