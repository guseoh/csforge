package com.guseoh.csforge.wrongnote.application;

import java.util.List;

/**
 * 오답 상세에서 공개할 정답 정보 모델이다.
 */
public record WrongNoteAnswerView(String correctChoiceKey, List<String> acceptedAnswers, String modelAnswer) {
}
