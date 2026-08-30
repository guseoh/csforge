package com.guseoh.csforge.wrongnote.api;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;

/**
 * 오답 노트 상세의 문제 HTTP 응답이다.
 */
public record WrongNoteQuestionResponse(long id, String promptMarkdown, QuestionType questionType, QuestionDifficulty difficulty, String explanationMarkdown) {
}
