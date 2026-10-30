package com.guseoh.csforge.wrongnote.application;

import java.util.List;

/**
 * bounded 오답 노트 목록과 페이지 정보를 전달하는 조회 모델이다.
 */
public record WrongNotePageView(List<WrongNoteListItemView> items, long totalElements, int page, int size) {
}
