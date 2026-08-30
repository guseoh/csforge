package com.guseoh.csforge.learning.api;

import java.util.List;

public record LearningAreaDetailResponse(
        long id,
        String slug,
        String name,
        String description,
        List<TopicSummaryResponse> topics) {
}
