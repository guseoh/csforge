package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;

/**
 * 오답 노트 상세의 문제 요약 모델이다.
 */
public record WrongNoteQuestionView(
        long id,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        String explanationMarkdown) {
}
