package com.guseoh.csforge.wrongnote.api;

import java.util.List;

/**
 * 오답 노트 상세의 HTTP 응답이다.
 */
public record WrongNoteDetailResponse(WrongNoteQuestionResponse question, List<WrongNoteConceptResponse> concepts,
        WrongNoteLatestAttemptResponse latestWrongAttempt, WrongNoteAnswerResponse answer, WrongNoteStateResponse state) {
}
