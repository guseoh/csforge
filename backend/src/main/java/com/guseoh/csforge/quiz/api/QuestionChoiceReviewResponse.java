package com.guseoh.csforge.quiz.api;

/** 제출 후 풀이 검토에 공개하는 선택지 응답이다. */
public record QuestionChoiceReviewResponse(String choiceKey, String contentMarkdown, String rationaleMarkdown) {
}
