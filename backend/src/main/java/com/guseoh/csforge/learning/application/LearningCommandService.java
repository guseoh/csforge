package com.guseoh.csforge.learning.application;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptProgress;
import com.guseoh.csforge.learning.domain.ConceptProgressRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.ConceptViewHistory;
import com.guseoh.csforge.learning.domain.ConceptViewHistoryRepository;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.domain.PersonalNote;
import com.guseoh.csforge.learning.domain.PersonalNoteRepository;
import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Concept 진행 상태와 개인 노트 변경 유스케이스를 처리한다. */
@Service
@RequiredArgsConstructor
public class LearningCommandService {

    private final ConceptRepository conceptRepository;
    private final ConceptProgressRepository progressRepository;
    private final ConceptViewHistoryRepository viewHistoryRepository;
    private final PersonalNoteRepository noteRepository;
    private final SearchProjectionChangeRecorder searchChangeRecorder;
    private final Clock clock;

    @Transactional
    public ConceptProgressView recordView(long conceptId) {
        Concept concept = findPublishedConcept(conceptId);
        ConceptProgress progress = progressRepository.findById(conceptId)
                .orElseGet(() -> new ConceptProgress(concept));
        Instant viewedAt = Instant.now(clock);
        progress.recordView(viewedAt);
        ConceptProgress savedProgress = progressRepository.saveAndFlush(progress);
        viewHistoryRepository.saveAndFlush(ConceptViewHistory.record(concept, viewedAt));
        return toProgressView(savedProgress);
    }

    @Transactional
    public ConceptProgressView updateProgress(
            long conceptId,
            LearningStatus requestedStatus,
            Boolean requestedBookmarked) {
        requireProgressChange(requestedStatus, requestedBookmarked);

        Concept concept = findPublishedConcept(conceptId);
        ConceptProgress progress = progressRepository.findById(conceptId)
                .orElseGet(() -> new ConceptProgress(concept));
        Instant changedAt = Instant.now(clock);

        applyStatus(progress, requestedStatus, changedAt);
        applyBookmark(progress, requestedBookmarked);
        return toProgressView(progressRepository.saveAndFlush(progress));
    }

    @Transactional
    public PersonalNoteView upsertNote(long conceptId, String content) {
        Concept concept = findPublishedConcept(conceptId);
        PersonalNote note = noteRepository.findByConcept_Id(conceptId)
                .orElseGet(() -> new PersonalNote(concept, content));
        note.changeContent(content);
        PersonalNote saved = noteRepository.saveAndFlush(note);
        searchChangeRecorder.record(SearchChangeType.PERSONAL_NOTE, saved.getId());
        return new PersonalNoteView(saved.getContent(), saved.getUpdatedAt());
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
        if (requestedStatus == null) return;
        switch (requestedStatus) {
            case LEARNING -> progress.startLearning();
            case COMPLETED -> progress.complete(changedAt);
            case REVIEW_NEEDED -> progress.markReviewNeeded();
            case UNSEEN -> throw new LearningBadRequestException(
                    "UNSEEN is assigned automatically and cannot be requested");
        }
    }

    private void applyBookmark(ConceptProgress progress, Boolean requestedBookmarked) {
        if (requestedBookmarked == null) return;
        if (requestedBookmarked) progress.bookmark();
        else progress.unbookmark();
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
}
