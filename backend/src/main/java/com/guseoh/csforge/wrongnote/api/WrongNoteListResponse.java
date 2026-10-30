package com.guseoh.csforge.wrongnote.api;

import java.util.List;

import com.guseoh.csforge.learning.api.PageMetadataResponse;

/**
 * 오답 노트 목록의 HTTP 응답이다.
 */
public record WrongNoteListResponse(List<WrongNoteListItemResponse> items, PageMetadataResponse page) {
}
