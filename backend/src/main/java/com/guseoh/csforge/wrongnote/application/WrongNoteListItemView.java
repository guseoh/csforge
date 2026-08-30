package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/**
 * 오답 노트 목록의 한 행에 필요한 애플리케이션 조회 모델이다.
 */
public record WrongNoteListItemView(
        long questionId,
        String promptMarkdown,
        QuestionType questionType,
        QuestionDifficulty difficulty,
        List<ConceptView> concepts,
        int wrongCount,
        Instant lastWrongAt,
        String status,
        ReviewScheduleStatus reviewStatus,
        Short reviewStage,
        Instant dueAt) {

    /**
     * 목록에 표시할 Concept 요약이다.
     */
    public record ConceptView(long id, String slug, String title, String areaSlug, String areaName, short level) {
    }
}
