package com.guseoh.csforge.learning.api;

import org.springframework.stereotype.Component;

import com.guseoh.csforge.learning.application.ConceptDetailView;
import com.guseoh.csforge.learning.application.ConceptNavigationView;
import com.guseoh.csforge.learning.application.ConceptPageView;
import com.guseoh.csforge.learning.application.ConceptProgressView;
import com.guseoh.csforge.learning.application.LearningAreaDetailView;
import com.guseoh.csforge.learning.application.LearningAreaSummaryView;
import com.guseoh.csforge.learning.application.PageMetadataView;
import com.guseoh.csforge.learning.application.PersonalNoteView;
import com.guseoh.csforge.learning.application.ReferenceView;
import com.guseoh.csforge.learning.application.TopicSummaryView;

/** Learning application view를 HTTP response로 변환하는 mapper이다. */
@Component
public class LearningApiMapper {

    public LearningAreaSummaryResponse toResponse(LearningAreaSummaryView area) {
        return new LearningAreaSummaryResponse(
                area.id(),
                area.slug(),
                area.name(),
                area.description(),
                area.topicCount(),
                area.publishedConceptCount(),
                area.completedConceptCount(),
                area.bookmarkedConceptCount(),
                new LevelProgressResponse(area.level1Total(), area.level1Completed()),
                new LevelProgressResponse(area.level2Total(), area.level2Completed()),
                new LevelProgressResponse(area.level3Total(), area.level3Completed()),
                area.publishedQuestionCount(),
                area.finalizedAttemptCount(),
                area.correctAttemptCount(),
                area.accuracyPercent());
    }

    public LearningAreaDetailResponse toResponse(LearningAreaDetailView area) {
        return new LearningAreaDetailResponse(
                area.id(),
                area.slug(),
                area.name(),
                area.description(),
                area.topics().stream().map(this::toTopicSummaryResponse).toList());
    }

    public ConceptPageResponse toResponse(ConceptPageView page) {
        return new ConceptPageResponse(
                page.items().stream().map(item -> new ConceptListItemResponse(
                        item.id(),
                        item.areaSlug(),
                        item.areaName(),
                        item.topicId(),
                        item.topicSlug(),
                        item.topicTitle(),
                        item.title(),
                        item.summary(),
                        item.level(),
                        item.contentStatus(),
                        item.learningStatus(),
                        item.bookmarked(),
                        item.lastViewedAt())).toList(),
                toResponse(page.page()));
    }

    public ConceptDetailResponse toResponse(ConceptDetailView concept) {
        return new ConceptDetailResponse(
                concept.id(),
                concept.contentKey(),
                concept.slug(),
                concept.title(),
                concept.summary(),
                concept.contentMarkdown(),
                concept.level(),
                concept.contentStatus(),
                new LearningAreaBreadcrumbResponse(
                        concept.area().id(), concept.area().slug(), concept.area().name()),
                new TopicBreadcrumbResponse(
                        concept.topic().id(), concept.topic().slug(), concept.topic().title()),
                toResponse(concept.progress()),
                concept.references().stream().map(this::toReferenceResponse).toList(),
                toResponse(concept.personalNote()),
                toResponse(concept.previous()),
                toResponse(concept.next()),
                concept.relatedConcepts().stream().map(this::toResponse).toList());
    }

    public ConceptProgressResponse toResponse(ConceptProgressView progress) {
        return new ConceptProgressResponse(
                progress.status(),
                progress.bookmarked(),
                progress.firstViewedAt(),
                progress.lastViewedAt(),
                progress.completedAt());
    }

    public PersonalNoteResponse toResponse(PersonalNoteView note) {
        return note == null ? null : new PersonalNoteResponse(note.content(), note.updatedAt());
    }

    private TopicSummaryResponse toTopicSummaryResponse(TopicSummaryView topic) {
        return new TopicSummaryResponse(
                topic.id(),
                topic.slug(),
                topic.title(),
                topic.description(),
                topic.publishedConceptCount(),
                topic.completedConceptCount(),
                topic.bookmarkedConceptCount(),
                topic.level1Count(),
                topic.level2Count(),
                topic.level3Count(),
                topic.unseenCount(),
                topic.learningCount(),
                topic.reviewNeededCount());
    }

    private PageMetadataResponse toResponse(PageMetadataView page) {
        return new PageMetadataResponse(
                page.page(),
                page.size(),
                page.totalElements(),
                page.totalPages(),
                page.hasNext(),
                page.hasPrevious());
    }

    private ReferenceResponse toReferenceResponse(ReferenceView reference) {
        return new ReferenceResponse(
                reference.id(),
                reference.url(),
                reference.title(),
                reference.type(),
                reference.language(),
                reference.depth(),
                reference.recommendation(),
                reference.displayOrder(),
                reference.relationNote());
    }

    private ConceptNavigationResponse toResponse(ConceptNavigationView navigation) {
        return navigation == null
                ? null
                : new ConceptNavigationResponse(navigation.id(), navigation.title(), navigation.level());
    }
}
