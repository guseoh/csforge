package com.guseoh.csforge.learning.application;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

/** Learning Area와 Concept 조회 유스케이스를 application view로 조합하는 서비스이다. */
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

    public List<LearningAreaSummaryView> listAreas() {
        Map<Long, Long> questionCounts = learningAreaQueryRepository.findAreaQuestionMetrics().stream()
                .collect(Collectors.toMap(LearningAreaQuestionMetricsView::areaId, LearningAreaQuestionMetricsView::publishedQuestionCount));
        Map<Long, LearningAreaAttemptMetricsView> attemptMetrics = learningAreaQueryRepository.findAreaAttemptMetrics().stream()
                .collect(Collectors.toMap(LearningAreaAttemptMetricsView::areaId, Function.identity()));
        return learningAreaQueryRepository.findAreaSummaries().stream()
                .map(area -> {
                    LearningAreaAttemptMetricsView attempts = attemptMetrics.get(area.id());
                    return area.withPracticeMetrics(
                            questionCounts.getOrDefault(area.id(), 0L),
                            attempts == null ? 0L : attempts.finalizedAttemptCount(),
                            attempts == null ? 0L : attempts.correctAttemptCount());
                })
                .toList();
    }

    public LearningAreaDetailView getArea(String areaSlug) {
        LearningAreaDetailView area = learningAreaQueryRepository.findAreaDetail(areaSlug)
                .orElseThrow(() -> new LearningNotFoundException("Learning area not found: " + areaSlug));
        return area;
    }

    public ConceptPageView listConcepts(ConceptSearchCriteria criteria) {
        ConceptSearchResult result = conceptSearchRepository.search(criteria);
        int totalPages = result.totalElements() == 0
                ? 0
                : (int) ((result.totalElements() + criteria.size() - 1) / criteria.size());
        PageMetadataView page = new PageMetadataView(
                criteria.page(),
                criteria.size(),
                result.totalElements(),
                totalPages,
                criteria.page() + 1 < totalPages,
                criteria.page() > 0);
        return new ConceptPageView(result.items(), page);
    }

    public ConceptDetailView getConcept(long conceptId) {
        Concept concept = findPublishedConcept(conceptId);
        Topic topic = concept.getTopic();
        LearningArea area = topic.getLearningArea();

        ConceptProgressView progress = progressRepository.findById(conceptId)
                .map(this::toProgressView)
                .orElseGet(this::unseenProgress);
        PersonalNoteView note = noteRepository.findByConcept_Id(conceptId)
                .map(found -> new PersonalNoteView(found.getContent(), found.getUpdatedAt()))
                .orElse(null);

        return new ConceptDetailView(
                concept.getId(),
                concept.getContentKey(),
                concept.getSlug(),
                concept.getTitle(),
                concept.getSummary(),
                concept.getContentMarkdown(),
                concept.getLevel(),
                concept.getStatus(),
                new LearningAreaBreadcrumbView(area.getId(), area.getSlug(), area.getName()),
                new TopicBreadcrumbView(topic.getId(), topic.getSlug(), topic.getTitle()),
                progress,
                conceptReferenceRepository.findAllByConceptId(conceptId).stream()
                        .map(this::toReferenceView)
                        .toList(),
                note,
                previousConcept(concept, topic, area),
                nextConcept(concept, topic, area),
                relatedConcepts(concept, topic));
    }

    private ConceptNavigationView previousConcept(Concept concept, Topic topic, LearningArea area) {
        return conceptRepository.findPreviousPublished(
                        concept.getId(),
                        area.getDisplayOrder(),
                        topic.getDisplayOrder(),
                        concept.getDisplayOrder(),
                        SINGLE_RESULT)
                .stream()
                .findFirst()
                .map(this::toNavigationView)
                .orElse(null);
    }

    private ConceptNavigationView nextConcept(Concept concept, Topic topic, LearningArea area) {
        return conceptRepository.findNextPublished(
                        concept.getId(),
                        area.getDisplayOrder(),
                        topic.getDisplayOrder(),
                        concept.getDisplayOrder(),
                        SINGLE_RESULT)
                .stream()
                .findFirst()
                .map(this::toNavigationView)
                .orElse(null);
    }

    private List<ConceptNavigationView> relatedConcepts(Concept concept, Topic topic) {
        return conceptRepository.findRelatedPublished(
                        concept.getId(),
                        topic.getId(),
                        concept.getDisplayOrder(),
                        RELATED_RESULTS)
                .stream()
                .map(this::toNavigationView)
                .toList();
    }

    private Concept findPublishedConcept(long conceptId) {
        return conceptRepository.findPublishedById(conceptId)
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + conceptId));
    }

    private ConceptProgressView toProgressView(ConceptProgress progress) {
        return new ConceptProgressView(
                progress.getStatus(),
                progress.isBookmarked(),
                progress.getFirstViewedAt(),
                progress.getLastViewedAt(),
                progress.getCompletedAt());
    }

    private ConceptProgressView unseenProgress() {
        return new ConceptProgressView(LearningStatus.UNSEEN, false, null, null, null);
    }

    private ReferenceView toReferenceView(ConceptReference conceptReference) {
        Reference reference = conceptReference.getReference();
        return new ReferenceView(
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

    private ConceptNavigationView toNavigationView(Concept concept) {
        return new ConceptNavigationView(concept.getId(), concept.getTitle(), concept.getLevel());
    }
}
