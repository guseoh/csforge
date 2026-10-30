package com.guseoh.csforge.wrongnote.application;

import java.util.List;

/**
 * 한 문제의 오답 노트 상세 조회 모델이다.
 */
public record WrongNoteDetailView(
        WrongNoteQuestionView question,
        List<WrongNoteListItemView.ConceptView> concepts,
        WrongNoteLatestAttemptView latestWrongAttempt,
        WrongNoteAnswerView answer,
        WrongNoteStateView state) {
}
