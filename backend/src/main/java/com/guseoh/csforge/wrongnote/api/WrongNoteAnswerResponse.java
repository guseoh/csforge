package com.guseoh.csforge.wrongnote.api;

import java.util.List;

/**
 * 오답 상세에 공개하는 정답 자료의 HTTP 응답이다.
 */
public record WrongNoteAnswerResponse(
        String correctChoiceKey,
        String correctChoiceContentMarkdown,
        List<String> acceptedAnswers,
        String modelAnswer) {
}
