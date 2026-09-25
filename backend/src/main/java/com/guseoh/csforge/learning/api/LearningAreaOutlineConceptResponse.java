package com.guseoh.csforge.learning.api;

import com.guseoh.csforge.learning.domain.LearningStatus;

/** 영역 학습 목차에서 화면에 필요한 개념 정보를 제공한다. */
public record LearningAreaOutlineConceptResponse(
        long id,
        long topicId,
        String title,
        String summary,
        short level,
        LearningStatus learningStatus) {
}
