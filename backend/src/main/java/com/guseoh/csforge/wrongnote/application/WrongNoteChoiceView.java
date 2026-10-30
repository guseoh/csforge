package com.guseoh.csforge.wrongnote.application;

/** 오답 상세에서 선택지와 학습 rationale을 전달하는 application view이다. */
public record WrongNoteChoiceView(String choiceKey, String contentMarkdown, String rationaleMarkdown) {
}
