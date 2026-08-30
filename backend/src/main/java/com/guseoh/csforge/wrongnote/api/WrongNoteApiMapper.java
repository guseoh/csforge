package com.guseoh.csforge.wrongnote.api;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.learning.api.PageMetadataResponse;
import com.guseoh.csforge.wrongnote.application.WrongNoteAttemptPageView;
import com.guseoh.csforge.wrongnote.application.WrongNoteAttemptView;
import com.guseoh.csforge.wrongnote.application.WrongNoteDetailView;
import com.guseoh.csforge.wrongnote.application.WrongNoteListItemView;
import com.guseoh.csforge.wrongnote.application.WrongNoteNoteView;
import com.guseoh.csforge.wrongnote.application.WrongNotePageView;

/**
 * 오답 노트 애플리케이션 모델을 HTTP 응답으로 변환하는 mapper이다.
 */
@Component
public class WrongNoteApiMapper {

    public WrongNoteListResponse toResponse(WrongNotePageView view) {
        return new WrongNoteListResponse(view.items().stream().map(this::toItem).toList(),
                new PageMetadataResponse(view.page(), view.size(), view.totalElements(),
                        (int) Math.ceil((double) view.totalElements() / view.size()),
                        (view.page() + 1L) * view.size() < view.totalElements(), view.page() > 0));
    }

    public WrongNoteDetailResponse toResponse(WrongNoteDetailView view) {
        return new WrongNoteDetailResponse(
                new WrongNoteQuestionResponse(view.question().id(), view.question().promptMarkdown(), view.question().questionType(), view.question().difficulty(), view.question().explanationMarkdown()),
                view.concepts().stream().map(item -> new WrongNoteConceptResponse(item.id(), item.slug(), item.title(), item.areaSlug(), item.areaName(), item.level())).toList(),
                view.latestWrongAttempt() == null ? null : new WrongNoteLatestAttemptResponse(view.latestWrongAttempt().attemptId(), view.latestWrongAttempt().quizId(), view.latestWrongAttempt().source(), view.latestWrongAttempt().selectedChoiceKey(), view.latestWrongAttempt().answerText(), view.latestWrongAttempt().gradingStatus(), view.latestWrongAttempt().correct(), view.latestWrongAttempt().reviewNeeded(), view.latestWrongAttempt().answeredAt(), view.latestWrongAttempt().gradedAt()),
                new WrongNoteAnswerResponse(view.answer().correctChoiceKey(), view.answer().acceptedAnswers(), view.answer().modelAnswer()),
                new WrongNoteStateResponse(view.state().status(), view.state().wrongCount(), view.state().firstWrongAt(), view.state().lastWrongAt(), view.state().causeNote(), view.state().reviewStatus(), view.state().reviewStage(), view.state().dueAt()));
    }

    public WrongNoteAttemptPageResponse toResponse(WrongNoteAttemptPageView view) {
        return new WrongNoteAttemptPageResponse(view.items().stream().map(this::toAttempt).toList(), view.nextCursor());
    }

    public WrongNoteNoteResponse toResponse(WrongNoteNoteView view) {
        return new WrongNoteNoteResponse(view.content(), view.updatedAt());
    }

    private WrongNoteListItemResponse toItem(WrongNoteListItemView item) {
        return new WrongNoteListItemResponse(item.questionId(), item.promptMarkdown(), item.questionType(), item.difficulty(),
                item.concepts().stream().map(concept -> new WrongNoteConceptResponse(concept.id(), concept.slug(), concept.title(), concept.areaSlug(), concept.areaName(), concept.level())).toList(),
                item.wrongCount(), item.lastWrongAt(), item.status(), item.reviewStatus(), item.reviewStage(), item.dueAt());
    }

    private WrongNoteAttemptResponse toAttempt(WrongNoteAttemptView item) {
        return new WrongNoteAttemptResponse(item.attemptId(), item.quizId(), item.source(), item.selectedChoiceKey(), item.answerText(), item.gradingStatus(), item.correct(), item.reviewNeeded(), item.answeredAt(), item.gradedAt(), item.updatedAt());
    }
}
