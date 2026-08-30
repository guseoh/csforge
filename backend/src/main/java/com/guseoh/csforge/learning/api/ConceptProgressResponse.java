package com.guseoh.csforge.learning.api;

import java.time.Instant;

import com.guseoh.csforge.learning.domain.LearningStatus;

public record ConceptProgressResponse(
        LearningStatus learningStatus,
        boolean bookmarked,
        Instant firstViewedAt,
        Instant lastViewedAt,
        Instant completedAt) {
}
