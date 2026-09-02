package com.guseoh.csforge.outcome.application;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.review.domain.ReviewHistory;
import com.guseoh.csforge.review.domain.ReviewHistoryRepository;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewTransition;
import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** finalized Attempt를 오답 노트와 복습 일정의 현재 상태로 반영하는 협력자이다. */
@Component
@RequiredArgsConstructor
public class FinalizedAttemptOutcomeCoordinator {

    private final WrongNoteRepository wrongNoteRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final SearchProjectionChangeRecorder searchChangeRecorder;
    private final Clock clock;

    public void process(Attempt attempt) {
        if (!attempt.isFinalized() || attempt.isOutcomeProcessed()) return;

        Instant processedAt = Instant.now(clock);
        Instant outcomeAt = attempt.getGradedAt() == null ? processedAt : attempt.getGradedAt();
        boolean correct = Boolean.TRUE.equals(attempt.getCorrect());
        if (attempt.getQuizSession().getSource() == QuizSessionSource.REVIEW) processReview(attempt, correct, outcomeAt);
        else processStandard(attempt, correct, outcomeAt);
        attempt.markOutcomeProcessed(processedAt);
    }

    private void processStandard(Attempt attempt, boolean correct, Instant outcomeAt) {
        if (!correct) {
            recordWrong(attempt, outcomeAt);
            ReviewSchedule schedule = findOrCreateSchedule(attempt, outcomeAt, false);
            schedule.restartFromFirstStage(attempt, outcomeAt);
            reviewScheduleRepository.save(schedule);
        } else if (attempt.isReviewNeeded()) {
            ReviewSchedule schedule = findOrCreateSchedule(attempt, outcomeAt, true);
            schedule.restartFromFirstStage(attempt, outcomeAt);
            reviewScheduleRepository.save(schedule);
        }
    }

    private void processReview(Attempt attempt, boolean correct, Instant outcomeAt) {
        if (!correct) recordWrong(attempt, outcomeAt);
        ReviewSchedule schedule = reviewScheduleRepository.findByQuestionId(attempt.getQuestion().getId())
                .orElseGet(() -> ReviewSchedule.start(attempt.getQuestion(), null, outcomeAt));
        ReviewTransition transition = schedule.applyReviewOutcome(attempt, correct, outcomeAt);
        if (transition.processed()) {
            reviewScheduleRepository.save(schedule);
            reviewHistoryRepository.save(ReviewHistory.record(attempt, transition));
            if (transition.stageAfter() == null && correct) {
                wrongNoteRepository.findByQuestionId(attempt.getQuestion().getId()).ifPresent(note -> {
                    note.markMastered();
                    searchChangeRecorder.record(SearchChangeType.WRONG_NOTE, note.getId());
                });
            }
        }
    }

    private void recordWrong(Attempt attempt, Instant outcomeAt) {
        WrongNote wrongNote = wrongNoteRepository.findByQuestionId(attempt.getQuestion().getId())
                .orElseGet(() -> WrongNote.open(attempt.getQuestion(), attempt, outcomeAt));
        wrongNote.recordWrong(attempt, outcomeAt);
        WrongNote saved = wrongNoteRepository.save(wrongNote);
        searchChangeRecorder.record(SearchChangeType.WRONG_NOTE, saved.getId());
    }

    private ReviewSchedule findOrCreateSchedule(Attempt attempt, Instant outcomeAt, boolean reviewNeeded) {
        return reviewScheduleRepository.findByQuestionId(attempt.getQuestion().getId())
                .orElseGet(() -> ReviewSchedule.start(attempt.getQuestion(), reviewNeeded ? attempt : null, outcomeAt));
    }
}
