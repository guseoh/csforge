package com.guseoh.csforge.learning.application;

import java.util.List;

public record LearningAreaDetailView(
        long id,
        String slug,
        String name,
        String description,
        List<TopicSummaryView> topics) {
}
