package com.guseoh.csforge.review.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.review.domain.ReviewHistory;
import com.guseoh.csforge.review.domain.ReviewHistoryRepository;
import com.guseoh.csforge.review.domain.ReviewResult;

/**
 * ReviewHistoryQueryService의 전체 및 문항별 복습 이력 페이지 조회를 검증한다.
 */
class ReviewHistoryQueryServiceTest {

    private static final Instant REVIEWED_AT = Instant.parse("2026-09-04T03:00:00Z");

    @Test
    void historyReturnsMappedItemsForAllAndSpecificQuestion() {
        ReviewHistoryRepository repository = mock(ReviewHistoryRepository.class);
        ReviewHistoryQueryService service = new ReviewHistoryQueryService(repository);

        Question question = mock(Question.class);
        when(question.getId()).thenReturn(7L);
        when(question.getPromptMarkdown()).thenReturn("트랜잭션 전파 옵션이란?");
        when(question.getQuestionType()).thenReturn(QuestionType.SHORT_ANSWER);
        when(question.getDifficulty()).thenReturn(QuestionDifficulty.MEDIUM);

        QuizSession session = mock(QuizSession.class);
        when(session.getId()).thenReturn(55L);

        ReviewHistory entry = mock(ReviewHistory.class);
        when(entry.getId()).thenReturn(1L);
        when(entry.getQuestion()).thenReturn(question);
        when(entry.getQuizSession()).thenReturn(session);
        when(entry.getResult()).thenReturn(ReviewResult.CORRECT);
        when(entry.getStageBefore()).thenReturn((short) 1);
        when(entry.getStageAfter()).thenReturn((short) 2);
        when(entry.getReviewedAt()).thenReturn(REVIEWED_AT);
        when(entry.getNextDueAt()).thenReturn(REVIEWED_AT.plusSeconds(259_200L));

        when(repository.findByQuestion_IdOrderByReviewedAtDescIdDesc(7L, PageRequest.of(0, 20)))
                .thenReturn(new PageImpl<>(List.of(entry), PageRequest.of(0, 20), 1));

        ReviewHistoryPageView view = service.history(7L, 0, 20);

        assertEquals(1, view.items().size());
        ReviewHistoryItemView item = view.items().getFirst();
        assertEquals(7L, item.questionId());
        assertEquals(55L, item.quizId());
        assertEquals(ReviewResult.CORRECT, item.result());
        assertEquals(1, item.stageBefore());
        assertEquals(2, item.stageAfter());
    }
}
