package com.guseoh.csforge.wrongnote.api;

/** 오답 상세의 선택지 검토 HTTP 응답이다. */
public record WrongNoteChoiceResponse(String choiceKey, String contentMarkdown, String rationaleMarkdown) {
}
