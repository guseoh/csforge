package com.guseoh.csforge.question.domain;

/** 문제에 연결된 개념과 학습 영역의 목록 표시 정보를 담는 조회 모델이다. */
public record QuestionConceptSummary(
        long questionId,
        long conceptId,
        String conceptSlug,
        String conceptTitle,
        short conceptLevel,
        String areaSlug,
        String areaName,
        String topicSlug,
        String topicTitle) {
}
