package com.guseoh.csforge.learning.api;

import java.util.List;

import com.guseoh.csforge.learning.domain.ContentStatus;

public record ConceptDetailResponse(
        long id,
        String contentKey,
        String slug,
        String title,
        String summary,
        String contentMarkdown,
        short level,
        ContentStatus contentStatus,
        LearningAreaBreadcrumbResponse area,
        TopicBreadcrumbResponse topic,
        ConceptProgressResponse progress,
        List<ReferenceResponse> references,
        PersonalNoteResponse personalNote,
        ConceptNavigationResponse previous,
        ConceptNavigationResponse next,
        List<ConceptNavigationResponse> relatedConcepts) {
}
