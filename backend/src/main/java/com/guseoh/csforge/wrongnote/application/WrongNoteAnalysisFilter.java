package com.guseoh.csforge.wrongnote.application;

/**
 * 오답 노트 목록에서 current wrong Attempt의 AI 분석 lifecycle을 제한하는 조건이다.
 */
public enum WrongNoteAnalysisFilter {
    ALL,
    NOT_REQUESTED,
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}
