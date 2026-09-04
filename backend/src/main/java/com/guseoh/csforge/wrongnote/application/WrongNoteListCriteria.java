package com.guseoh.csforge.wrongnote.application;

import java.time.Instant;
import java.util.Objects;

import com.guseoh.csforge.question.domain.QuestionDifficulty;

/**
 * 오답 노트 목록 조회의 필터와 정렬 조건이다.
 */
public record WrongNoteListCriteria(
        String areaSlug,
        Long topicId,
        Short level,
        QuestionDifficulty difficulty,
        com.guseoh.csforge.wrongnote.domain.WrongNoteStatus status,
        WrongNoteReviewFilter reviewFilter,
        WrongNoteAnalysisFilter analysisFilter,
        WrongNoteSort sort,
        Instant now) {

    public WrongNoteListCriteria(
            String areaSlug,
            Long topicId,
            Short level,
            QuestionDifficulty difficulty,
            com.guseoh.csforge.wrongnote.domain.WrongNoteStatus status,
            WrongNoteReviewFilter reviewFilter,
            WrongNoteAnalysisFilter analysisFilter,
            WrongNoteSort sort) {
        this(areaSlug, topicId, level, difficulty, status, reviewFilter, analysisFilter, sort, null);
    }

    public WrongNoteListCriteria at(Instant now) {
        return new WrongNoteListCriteria(
                areaSlug,
                topicId,
                level,
                difficulty,
                status,
                reviewFilter,
                analysisFilter,
                sort,
                Objects.requireNonNull(now, "now is required"));
    }
}
