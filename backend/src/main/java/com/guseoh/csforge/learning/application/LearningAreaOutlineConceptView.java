package com.guseoh.csforge.learning.application;

import com.guseoh.csforge.learning.domain.LearningStatus;

/** 영역 목차 한 행에 필요한 최소 application data이다. */
public record LearningAreaOutlineConceptView(
        long id,
        long topicId,
        String title,
        String summary,
        short level,
        LearningStatus learningStatus) {
}
