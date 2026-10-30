package com.guseoh.csforge.wrongnote.api;

/**
 * 오답 문제와 연결된 Concept의 HTTP 응답이다.
 */
public record WrongNoteConceptResponse(long id, String slug, String title, String areaSlug, String areaName, short level) {
}
