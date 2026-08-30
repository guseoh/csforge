package com.guseoh.csforge.wrongnote.application;

/**
 * 오답 노트 목록에서 복습 일정으로 제한하는 조건이다.
 */
public enum WrongNoteReviewFilter {
    ALL,
    SCHEDULED,
    DUE,
    MASTERED,
    NONE
}
