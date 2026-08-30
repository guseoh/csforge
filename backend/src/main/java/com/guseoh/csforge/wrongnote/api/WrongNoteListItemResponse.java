package com.guseoh.csforge.wrongnote.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 오답 노트 목록 항목의 HTTP 응답이다.
 */
public record WrongNoteListItemResponse(long questionId, String promptMarkdown, QuestionType questionType, QuestionDifficulty difficulty,
        List<WrongNoteConceptResponse> concepts, int wrongCount, Instant lastWrongAt, String status,
        ReviewScheduleStatus reviewStatus, Short reviewStage, Instant dueAt) {
}
