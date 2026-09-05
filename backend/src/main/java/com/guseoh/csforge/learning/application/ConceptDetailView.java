package com.guseoh.csforge.learning.application;

import java.util.List;

import com.guseoh.csforge.learning.domain.ContentStatus;

/** Concept 상세 조회 결과를 API와 분리해 전달하는 application view이다. */
public record ConceptDetailView(
        long id,
        String contentKey,
        String slug,
        String title,
        String summary,
        String contentMarkdown,
        short level,
        ContentStatus contentStatus,
        LearningAreaBreadcrumbView area,
        TopicBreadcrumbView topic,
        ConceptProgressView progress,
        List<ReferenceView> references,
        PersonalNoteView personalNote,
        ConceptNavigationView previous,
        ConceptNavigationView next,
        List<ConceptNavigationView> relatedConcepts) {
}
