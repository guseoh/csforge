package com.guseoh.csforge.learning.application;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.learning.api.LearningDtos;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptProgress;
import com.guseoh.csforge.learning.domain.ConceptProgressRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.PersonalNote;
import com.guseoh.csforge.learning.domain.PersonalNoteRepository;
import com.guseoh.csforge.learning.infrastructure.LearningQueryRepository;
import com.guseoh.csforge.learning.infrastructure.LearningQueryRepository.ConceptFilter;

@Service
public class LearningService {

    private final LearningQueryRepository queryRepository;
    private final ConceptRepository conceptRepository;
    private final ConceptProgressRepository progressRepository;
    private final PersonalNoteRepository noteRepository;

    public LearningService(
            LearningQueryRepository queryRepository,
            ConceptRepository conceptRepository,
            ConceptProgressRepository progressRepository,
            PersonalNoteRepository noteRepository) {
        this.queryRepository = queryRepository;
        this.conceptRepository = conceptRepository;
        this.progressRepository = progressRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional(readOnly = true)
    public List<LearningDtos.AreaSummary> listAreas() {
        return queryRepository.findAreaSummaries();
    }

    @Transactional(readOnly = true)
    public LearningDtos.AreaDetail getArea(String areaSlug) {
        return queryRepository.findAreaDetail(areaSlug)
                .orElseThrow(() -> new LearningNotFoundException("Learning area not found: " + areaSlug));
    }

    @Transactional(readOnly = true)
    public LearningDtos.ConceptPage listConcepts(ConceptFilter filter) {
        validateFilter(filter);
        LearningQueryRepository.ConceptPageResult result = queryRepository.findConceptPage(filter);
        return new LearningDtos.ConceptPage(result.items(), result.page());
    }

    @Transactional(readOnly = true)
    public LearningDtos.ConceptDetail getConcept(long conceptId) {
        LearningQueryRepository.ConceptHeader header = queryRepository.findConceptHeader(conceptId)
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + conceptId));

        List<LearningQueryRepository.NavigationRow> navigation = queryRepository.findNavigation(conceptId);
        LearningDtos.ConceptNavigation previous = navigation.stream()
                .filter(LearningQueryRepository.NavigationRow::previous)
                .map(LearningQueryRepository.NavigationRow::concept)
                .findFirst()
                .orElse(null);
        LearningDtos.ConceptNavigation next = navigation.stream()
                .filter(row -> !row.previous())
                .map(LearningQueryRepository.NavigationRow::concept)
                .findFirst()
                .orElse(null);

        LearningDtos.NoteDetail note = header.noteContent() == null
                ? null
                : new LearningDtos.NoteDetail(header.noteContent(), header.noteUpdatedAt());
        return new LearningDtos.ConceptDetail(
                header.id(),
                header.contentKey(),
                header.slug(),
                header.title(),
                header.summary(),
                header.contentMarkdown(),
                header.level(),
                header.contentStatus(),
                new LearningDtos.AreaBreadcrumb(header.areaId(), header.areaSlug(), header.areaName()),
                new LearningDtos.TopicBreadcrumb(header.topicId(), header.topicSlug(), header.topicTitle()),
                new LearningDtos.ProgressState(
                        header.learningStatus(), header.bookmarked(), header.firstViewedAt(),
                        header.lastViewedAt(), header.completedAt()),
                queryRepository.findReferences(conceptId),
                note,
                previous,
                next,
                queryRepository.findRelated(conceptId, header.topicId(), header.displayOrder()));
    }

    @Transactional
    public LearningDtos.ProgressResponse recordView(long conceptId) {
        Concept concept = findPublishedConcept(conceptId);
        ConceptProgress progress = progressRepository.findById(conceptId)
                .orElseGet(() -> new ConceptProgress(concept));
        progress.recordView(Instant.now());
        ConceptProgress saved = progressRepository.saveAndFlush(progress);
        return toProgressResponse(saved);
    }

    @Transactional
    public LearningDtos.ProgressResponse updateProgress(
            long conceptId,
            LearningStatus requestedStatus,
            Boolean requestedBookmarked) {
        if (requestedStatus == null && requestedBookmarked == null) {
            throw new LearningBadRequestException("At least one of status or bookmarked is required");
        }
        if (requestedStatus == LearningStatus.UNSEEN) {
            throw new LearningBadRequestException("UNSEEN is assigned automatically and cannot be requested");
        }

        Concept concept = findPublishedConcept(conceptId);
        ConceptProgress progress = progressRepository.findById(conceptId)
                .orElseGet(() -> new ConceptProgress(concept));
        progress.update(requestedStatus, requestedBookmarked, Instant.now());
        ConceptProgress saved = progressRepository.saveAndFlush(progress);
        return toProgressResponse(saved);
    }

    @Transactional
    public LearningDtos.NoteResponse upsertNote(long conceptId, String content) {
        Concept concept = findPublishedConcept(conceptId);
        PersonalNote note = noteRepository.findByConcept_Id(conceptId)
                .orElseGet(() -> new PersonalNote(concept, content));
        note.updateContent(content);
        PersonalNote saved = noteRepository.saveAndFlush(note);
        return new LearningDtos.NoteResponse(saved.getContent(), saved.getUpdatedAt());
    }

    private Concept findPublishedConcept(long conceptId) {
        return conceptRepository.findPublishedById(conceptId)
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + conceptId));
    }

    private LearningDtos.ProgressResponse toProgressResponse(ConceptProgress progress) {
        return new LearningDtos.ProgressResponse(
                progress.getStatus(),
                progress.isBookmarked(),
                progress.getFirstViewedAt(),
                progress.getLastViewedAt(),
                progress.getCompletedAt());
    }

    private void validateFilter(ConceptFilter filter) {
        if (filter.page() < 0 || filter.page() > 1_000_000) {
            throw new LearningBadRequestException("page must be between 0 and 1000000");
        }
        if (filter.size() < 1 || filter.size() > 100) {
            throw new LearningBadRequestException("size must be between 1 and 100");
        }
        if (filter.level() != null && (filter.level() < 1 || filter.level() > 3)) {
            throw new LearningBadRequestException("level must be between 1 and 3");
        }
        if (filter.topicId() != null && filter.topicId() < 1) {
            throw new LearningBadRequestException("topic must be a positive id");
        }
        if (filter.q() != null && filter.q().length() > 200) {
            throw new LearningBadRequestException("q must be at most 200 characters");
        }
    }

}
