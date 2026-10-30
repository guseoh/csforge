package com.guseoh.csforge.learning.application;

import java.util.List;

/** Learning Area 상세 조회 결과를 API와 분리해 전달하는 application view이다. */
public record LearningAreaDetailView(
        long id,
        String slug,
        String name,
        String description,
        List<TopicSummaryView> topics) {
}
