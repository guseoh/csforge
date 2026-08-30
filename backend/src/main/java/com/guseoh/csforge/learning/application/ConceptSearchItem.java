package com.guseoh.csforge.learning.application;

import java.time.Instant;

import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningStatus;

public record ConceptSearchItem(
        long id,
        String areaSlug,
        String areaName,
        long topicId,
        String topicSlug,
        String topicTitle,
        String title,
        String summary,
        short level,
        ContentStatus contentStatus,
        LearningStatus learningStatus,
        boolean bookmarked,
        Instant lastViewedAt) {
}
