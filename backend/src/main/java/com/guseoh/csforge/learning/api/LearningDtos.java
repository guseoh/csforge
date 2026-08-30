package com.guseoh.csforge.learning.api;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.ReferenceType;

public final class LearningDtos {

    private LearningDtos() {
    }

    public record LevelProgress(long total, long completed) {
    }

    public record AreaSummary(
            long id,
            String slug,
            String name,
            String description,
            long topicCount,
            long publishedConceptCount,
            long completedConceptCount,
            long bookmarkedConceptCount,
            LevelProgress level1,
            LevelProgress level2,
            LevelProgress level3) {
    }

    public record TopicSummary(
            long id,
            String slug,
            String title,
            String description,
            long publishedConceptCount,
            long completedConceptCount,
            long bookmarkedConceptCount,
            long level1Count,
            long level2Count,
            long level3Count,
            long unseenCount,
            long learningCount,
            long reviewNeededCount) {
    }

    public record AreaDetail(
            long id,
            String slug,
            String name,
            String description,
            List<TopicSummary> topics) {
    }

    public record ConceptListItem(
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

    public record PageMetadata(
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean hasNext,
            boolean hasPrevious) {
    }

    public record ConceptPage(List<ConceptListItem> items, PageMetadata page) {
    }

    public record ProgressState(
            LearningStatus learningStatus,
            boolean bookmarked,
            Instant firstViewedAt,
            Instant lastViewedAt,
            Instant completedAt) {
    }

    public record ReferenceDetail(
            long id,
            String url,
            String title,
            ReferenceType type,
            String language,
            String depth,
            String recommendation,
            int displayOrder,
            String relationNote) {
    }

    public record NoteDetail(String content, Instant updatedAt) {
    }

    public record ConceptNavigation(long id, String title, short level) {
    }

    public record ConceptDetail(
            long id,
            String contentKey,
            String slug,
            String title,
            String summary,
            String contentMarkdown,
            short level,
            ContentStatus contentStatus,
            AreaBreadcrumb area,
            TopicBreadcrumb topic,
            ProgressState progress,
            List<ReferenceDetail> references,
            NoteDetail personalNote,
            ConceptNavigation previous,
            ConceptNavigation next,
            List<ConceptNavigation> relatedConcepts) {
    }

    public record AreaBreadcrumb(long id, String slug, String name) {
    }

    public record TopicBreadcrumb(long id, String slug, String title) {
    }

    public record ProgressUpdateRequest(LearningStatus status, Boolean bookmarked) {
    }

    public record ProgressResponse(
            LearningStatus learningStatus,
            boolean bookmarked,
            Instant firstViewedAt,
            Instant lastViewedAt,
            Instant completedAt) {
    }

    public record NoteUpsertRequest(
            @jakarta.validation.constraints.NotNull
            @jakarta.validation.constraints.Size(max = 100_000)
            String content) {
    }

    public record NoteResponse(String content, Instant updatedAt) {
    }
}
