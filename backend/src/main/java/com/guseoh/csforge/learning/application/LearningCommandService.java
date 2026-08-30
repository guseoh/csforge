package com.guseoh.csforge.learning.application;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.learning.api.ConceptProgressResponse;
import com.guseoh.csforge.learning.api.PersonalNoteResponse;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptProgress;
import com.guseoh.csforge.learning.domain.ConceptProgressRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.PersonalNote;
import com.guseoh.csforge.learning.domain.PersonalNoteRepository;

@Service
public class LearningCommandService {

    private final ConceptRepository conceptRepository;
    private final ConceptProgressRepository progressRepository;
    private final PersonalNoteRepository noteRepository;

    public LearningCommandService(
            ConceptRepository conceptRepository,
            ConceptProgressRepository progressRepository,
            PersonalNoteRepository noteRepository) {
        this.conceptRepository = conceptRepository;
        this.progressRepository = progressRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional
    public ConceptProgressResponse recordView(long conceptId) {
        Concept concept = findPublishedConcept(conceptId);
        ConceptProgress progress = progressRepository.findById(conceptId)
                .orElseGet(() -> new ConceptProgress(concept));
        progress.recordView(Instant.now());
        return toProgressResponse(progressRepository.saveAndFlush(progress));
    }

    @Transactional
    public ConceptProgressResponse updateProgress(
            long conceptId,
            LearningStatus requestedStatus,
            Boolean requestedBookmarked) {
        requireProgressChange(requestedStatus, requestedBookmarked);

        Concept concept = findPublishedConcept(conceptId);
        ConceptProgress progress = progressRepository.findById(conceptId)
                .orElseGet(() -> new ConceptProgress(concept));
        Instant changedAt = Instant.now();

        applyStatus(progress, requestedStatus, changedAt);
        applyBookmark(progress, requestedBookmarked);
        return toProgressResponse(progressRepository.saveAndFlush(progress));
    }

    @Transactional
    public PersonalNoteResponse upsertNote(long conceptId, String content) {
        Concept concept = findPublishedConcept(conceptId);
        PersonalNote note = noteRepository.findByConcept_Id(conceptId)
                .orElseGet(() -> new PersonalNote(concept, content));
        note.changeContent(content);
        PersonalNote saved = noteRepository.saveAndFlush(note);
        return new PersonalNoteResponse(saved.getContent(), saved.getUpdatedAt());
    }

    private void requireProgressChange(LearningStatus requestedStatus, Boolean requestedBookmarked) {
        if (requestedStatus == null && requestedBookmarked == null) {
            throw new LearningBadRequestException("At least one of status or bookmarked is required");
        }
        if (requestedStatus == LearningStatus.UNSEEN) {
            throw new LearningBadRequestException("UNSEEN is assigned automatically and cannot be requested");
        }
    }

    private void applyStatus(ConceptProgress progress, LearningStatus requestedStatus, Instant changedAt) {
        if (requestedStatus == null) {
            return;
        }
        switch (requestedStatus) {
            case LEARNING -> progress.startLearning();
            case COMPLETED -> progress.complete(changedAt);
            case REVIEW_NEEDED -> progress.markReviewNeeded();
            case UNSEEN -> throw new LearningBadRequestException(
                    "UNSEEN is assigned automatically and cannot be requested");
        }
    }

    private void applyBookmark(ConceptProgress progress, Boolean requestedBookmarked) {
        if (requestedBookmarked == null) {
            return;
        }
        if (requestedBookmarked) {
            progress.bookmark();
        } else {
            progress.unbookmark();
        }
    }

    private Concept findPublishedConcept(long conceptId) {
        return conceptRepository.findPublishedById(conceptId)
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + conceptId));
    }

    private ConceptProgressResponse toProgressResponse(ConceptProgress progress) {
        return new ConceptProgressResponse(
                progress.getStatus(),
                progress.isBookmarked(),
                progress.getFirstViewedAt(),
                progress.getLastViewedAt(),
                progress.getCompletedAt());
    }
}
