package com.guseoh.csforge.ai.api;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.ai.application.WrongAnswerAnalysisReadStatus;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisResult;
import com.guseoh.csforge.ai.application.WrongAnswerAnalysisView;

/** AI application view를 HTTP response contract로 변환한다. */
@Component
public class WrongAnswerAnalysisApiMapper {

    public WrongAnswerAnalysisResponse toResponse(WrongAnswerAnalysisView view) {
        return new WrongAnswerAnalysisResponse(
                view.questionId(),
                view.attemptId(),
                toStatus(view.status()),
                view.available(),
                view.providerConfigured(),
                view.retryable(),
                view.result() == null ? null : toResult(view.result(), view),
                view.requestedAt(),
                view.startedAt(),
                view.completedAt(),
                view.failedAt(),
                view.errorCode(),
                view.errorMessage());
    }

    private WrongAnswerAnalysisResultResponse toResult(
            WrongAnswerAnalysisResult result,
            WrongAnswerAnalysisView view) {
        return new WrongAnswerAnalysisResultResponse(
                result.whyWrong(),
                result.missedConcepts(),
                result.correctUnderstanding(),
                result.relatedConceptKeys(),
                view.relatedConcepts().stream()
                        .map(concept -> new WrongAnswerRelatedConceptResponse(
                                concept.id(),
                                concept.contentKey(),
                                concept.slug(),
                                concept.title(),
                                concept.areaSlug(),
                                concept.areaName(),
                                concept.level()))
                        .toList(),
                result.followUpQuestions());
    }

    private WrongAnswerAnalysisStatusResponse toStatus(WrongAnswerAnalysisReadStatus status) {
        return WrongAnswerAnalysisStatusResponse.valueOf(status.name());
    }
}
