package com.guseoh.csforge.learning.application;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.learning.api.ConceptDetailResponse;
import com.guseoh.csforge.learning.api.ConceptListItemResponse;
import com.guseoh.csforge.learning.api.ConceptNavigationResponse;
import com.guseoh.csforge.learning.api.ConceptPageResponse;
import com.guseoh.csforge.learning.api.ConceptProgressResponse;
import com.guseoh.csforge.learning.api.LearningAreaBreadcrumbResponse;
import com.guseoh.csforge.learning.api.LearningAreaDetailResponse;
import com.guseoh.csforge.learning.api.LearningAreaSummaryResponse;
import com.guseoh.csforge.learning.api.LevelProgressResponse;
import com.guseoh.csforge.learning.api.PageMetadataResponse;
import com.guseoh.csforge.learning.api.PersonalNoteResponse;
import com.guseoh.csforge.learning.api.ReferenceResponse;
import com.guseoh.csforge.learning.api.TopicBreadcrumbResponse;
import com.guseoh.csforge.learning.api.TopicSummaryResponse;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptProgress;
import com.guseoh.csforge.learning.domain.ConceptProgressRepository;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.ConceptReferenceRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.PersonalNoteRepository;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.learning.infrastructure.ConceptSearchRepository;
import com.guseoh.csforge.learning.infrastructure.LearningAreaQueryRepository;

@Service
@Transactional(readOnly = true)
public class LearningQueryService {

    private static final Pageable SINGLE_RESULT = PageRequest.of(0, 1);
    private static final Pageable RELATED_RESULTS = PageRequest.of(0, 5);

    private final LearningAreaQueryRepository learningAreaQueryRepository;
    private final ConceptSearchRepository conceptSearchRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptProgressRepository progressRepository;
    private final PersonalNoteRepository noteRepository;
    private final ConceptReferenceRepository conceptReferenceRepository;

    public LearningQueryService(
            LearningAreaQueryRepository learningAreaQueryRepository,
            ConceptSearchRepository conceptSearchRepository,
            ConceptRepository conceptRepository,
            ConceptProgressRepository progressRepository,
            PersonalNoteRepository noteRepository,
            ConceptReferenceRepository conceptReferenceRepository) {
        this.learningAreaQueryRepository = learningAreaQueryRepository;
        this.conceptSearchRepository = conceptSearchRepository;
        this.conceptRepository = conceptRepository;
        this.progressRepository = progressRepository;
        this.noteRepository = noteRepository;
        this.conceptReferenceRepository = conceptReferenceRepository;
    }

    public List<LearningAreaSummaryResponse> listAreas() {
        return learningAreaQueryRepository.findAreaSummaries().stream()
                .map(this::toAreaSummaryResponse)
                .toList();
    }

    public LearningAreaDetailResponse getArea(String areaSlug) {
        LearningAreaDetailView area = learningAreaQueryRepository.findAreaDetail(areaSlug)
                .orElseThrow(() -> new LearningNotFoundException("Learning area not found: " + areaSlug));
        return new LearningAreaDetailResponse(
                area.id(),
                area.slug(),
                area.name(),
                area.description(),
                area.topics().stream().map(this::toTopicSummaryResponse).toList());
    }

    public ConceptPageResponse listConcepts(ConceptSearchCriteria criteria) {
        ConceptSearchResult result = conceptSearchRepository.search(criteria);
        int totalPages = result.totalElements() == 0
                ? 0
                : (int) ((result.totalElements() + criteria.size() - 1) / criteria.size());
        PageMetadataResponse page = new PageMetadataResponse(
                criteria.page(),
                criteria.size(),
                result.totalElements(),
                totalPages,
                criteria.page() + 1 < totalPages,
                criteria.page() > 0);
        return new ConceptPageResponse(
                result.items().stream().map(this::toConceptListItemResponse).toList(),
                page);
    }

    public ConceptDetailResponse getConcept(long conceptId) {
        Concept concept = findPublishedConcept(conceptId);
        Topic topic = concept.getTopic();
        LearningArea area = topic.getLearningArea();

        ConceptProgressResponse progress = progressRepository.findById(conceptId)
                .map(this::toProgressResponse)
                .orElseGet(this::unseenProgress);
        PersonalNoteResponse note = noteRepository.findByConcept_Id(conceptId)
                .map(found -> new PersonalNoteResponse(found.getContent(), found.getUpdatedAt()))
                .orElse(null);

        return new ConceptDetailResponse(
                concept.getId(),
                concept.getContentKey(),
                concept.getSlug(),
                concept.getTitle(),
                concept.getSummary(),
                concept.getContentMarkdown(),
                concept.getLevel(),
                concept.getStatus(),
                new LearningAreaBreadcrumbResponse(area.getId(), area.getSlug(), area.getName()),
                new TopicBreadcrumbResponse(topic.getId(), topic.getSlug(), topic.getTitle()),
                progress,
                conceptReferenceRepository.findAllByConceptId(conceptId).stream()
                        .map(this::toReferenceResponse)
                        .toList(),
                note,
                previousConcept(concept, topic, area),
                nextConcept(concept, topic, area),
                relatedConcepts(concept, topic));
    }

    private ConceptNavigationResponse previousConcept(Concept concept, Topic topic, LearningArea area) {
        return conceptRepository.findPreviousPublished(
                        concept.getId(),
                        area.getDisplayOrder(),
                        topic.getDisplayOrder(),
                        concept.getDisplayOrder(),
                        SINGLE_RESULT)
                .stream()
                .findFirst()
                .map(this::toNavigationResponse)
                .orElse(null);
    }

    private ConceptNavigationResponse nextConcept(Concept concept, Topic topic, LearningArea area) {
        return conceptRepository.findNextPublished(
                        concept.getId(),
                        area.getDisplayOrder(),
                        topic.getDisplayOrder(),
                        concept.getDisplayOrder(),
                        SINGLE_RESULT)
                .stream()
                .findFirst()
                .map(this::toNavigationResponse)
                .orElse(null);
    }

    private List<ConceptNavigationResponse> relatedConcepts(Concept concept, Topic topic) {
        return conceptRepository.findRelatedPublished(
                        concept.getId(),
                        topic.getId(),
                        concept.getDisplayOrder(),
                        RELATED_RESULTS)
                .stream()
                .map(this::toNavigationResponse)
                .toList();
    }

    private Concept findPublishedConcept(long conceptId) {
        return conceptRepository.findPublishedById(conceptId)
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + conceptId));
    }

    private LearningAreaSummaryResponse toAreaSummaryResponse(LearningAreaSummaryView area) {
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
                new LevelProgressResponse(area.level3Total(), area.level3Completed()));
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

    private ConceptListItemResponse toConceptListItemResponse(ConceptSearchItem concept) {
        return new ConceptListItemResponse(
                concept.id(),
                concept.areaSlug(),
                concept.areaName(),
                concept.topicId(),
                concept.topicSlug(),
                concept.topicTitle(),
                concept.title(),
                concept.summary(),
                concept.level(),
                concept.contentStatus(),
                concept.learningStatus(),
                concept.bookmarked(),
                concept.lastViewedAt());
    }

    private ConceptProgressResponse toProgressResponse(ConceptProgress progress) {
        return new ConceptProgressResponse(
                progress.getStatus(),
                progress.isBookmarked(),
                progress.getFirstViewedAt(),
                progress.getLastViewedAt(),
                progress.getCompletedAt());
    }

    private ConceptProgressResponse unseenProgress() {
        return new ConceptProgressResponse(LearningStatus.UNSEEN, false, null, null, null);
    }

    private ReferenceResponse toReferenceResponse(ConceptReference conceptReference) {
        Reference reference = conceptReference.getReference();
        return new ReferenceResponse(
                reference.getId(),
                reference.getUrl(),
                reference.getTitle(),
                reference.getReferenceType(),
                reference.getLanguageCode(),
                reference.getDepth(),
                reference.getRecommendation(),
                conceptReference.getDisplayOrder(),
                conceptReference.getRelationNote());
    }

    private ConceptNavigationResponse toNavigationResponse(Concept concept) {
        return new ConceptNavigationResponse(concept.getId(), concept.getTitle(), concept.getLevel());
    }
}
