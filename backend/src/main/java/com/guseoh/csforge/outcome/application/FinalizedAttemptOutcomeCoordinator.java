package com.guseoh.csforge.outcome.application;

import java.time.Clock;
import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.review.domain.ReviewHistory;
import com.guseoh.csforge.review.domain.ReviewHistoryRepository;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewTransition;
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
    private final Clock clock;

    public void process(Attempt attempt) {
        processAll(List.of(attempt));
    }

    public void processAll(Collection<Attempt> attempts) {
        List<Attempt> pending = attempts.stream()
                .filter(attempt -> attempt.isFinalized() && !attempt.isOutcomeProcessed())
                .toList();
        if (pending.isEmpty()) return;

        Instant processedAt = Instant.now(clock);
        List<Long> questionIds = pending.stream()
                .filter(attempt -> attempt.hasAnswer() || attempt.isReviewNeeded())
                .map(attempt -> attempt.getQuestion().getId())
                .distinct()
                .toList();

        Map<Long, WrongNote> wrongNotesByQuestionId = new HashMap<>();
        Map<Long, ReviewSchedule> schedulesByQuestionId = new HashMap<>();
        if (!questionIds.isEmpty()) {
            wrongNoteRepository.findByQuestionIdIn(questionIds)
                    .forEach(note -> wrongNotesByQuestionId.put(note.getQuestion().getId(), note));
            reviewScheduleRepository.findByQuestionIdIn(questionIds)
                    .forEach(schedule -> schedulesByQuestionId.put(schedule.getQuestionId(), schedule));
        }

        for (Attempt attempt : pending) {
            Instant outcomeAt = attempt.getGradedAt() == null ? processedAt : attempt.getGradedAt();
            if (!attempt.hasAnswer()) {
                if (attempt.isReviewNeeded()) {
                    scheduleReviewNeeded(attempt, outcomeAt, schedulesByQuestionId);
                }
                attempt.markOutcomeProcessed(processedAt);
                continue;
            }
            boolean correct = Boolean.TRUE.equals(attempt.getCorrect());
            if (attempt.getQuizSession().getSource() == QuizSessionSource.REVIEW) {
                processReview(attempt, correct, outcomeAt, wrongNotesByQuestionId, schedulesByQuestionId);
            } else {
                processStandard(attempt, correct, outcomeAt, wrongNotesByQuestionId, schedulesByQuestionId);
            }
            attempt.markOutcomeProcessed(processedAt);
        }
    }

    private void processStandard(
            Attempt attempt,
            boolean correct,
            Instant outcomeAt,
            Map<Long, WrongNote> wrongNotesByQuestionId,
            Map<Long, ReviewSchedule> schedulesByQuestionId) {
        if (!correct) {
            recordWrong(attempt, outcomeAt, wrongNotesByQuestionId);
            ReviewSchedule schedule = findOrCreateSchedule(attempt, outcomeAt, false, schedulesByQuestionId);
            schedule.restartFromFirstStage(attempt, outcomeAt);
            schedulesByQuestionId.put(schedule.getQuestionId(), reviewScheduleRepository.save(schedule));
        } else if (attempt.isReviewNeeded()) {
            scheduleReviewNeeded(attempt, outcomeAt, schedulesByQuestionId);
        }
    }

    private void scheduleReviewNeeded(
            Attempt attempt,
            Instant outcomeAt,
            Map<Long, ReviewSchedule> schedulesByQuestionId) {
        ReviewSchedule schedule = findOrCreateSchedule(attempt, outcomeAt, true, schedulesByQuestionId);
        schedule.restartFromFirstStage(attempt, outcomeAt);
        schedulesByQuestionId.put(schedule.getQuestionId(), reviewScheduleRepository.save(schedule));
    }

    private void processReview(
            Attempt attempt,
            boolean correct,
            Instant outcomeAt,
            Map<Long, WrongNote> wrongNotesByQuestionId,
            Map<Long, ReviewSchedule> schedulesByQuestionId) {
        if (!correct) recordWrong(attempt, outcomeAt, wrongNotesByQuestionId);
        Long questionId = attempt.getQuestion().getId();
        ReviewSchedule schedule = schedulesByQuestionId.computeIfAbsent(
                questionId, ignored -> ReviewSchedule.start(attempt.getQuestion(), null, outcomeAt));
        ReviewTransition transition = schedule.applyReviewOutcome(attempt, correct, outcomeAt);
        if (transition.processed()) {
            schedulesByQuestionId.put(questionId, reviewScheduleRepository.save(schedule));
            reviewHistoryRepository.save(ReviewHistory.record(attempt, transition));
            if (transition.stageAfter() == null && correct) {
                WrongNote note = wrongNotesByQuestionId.get(questionId);
                if (note != null) {
                    note.markMastered();
                }
            }
        }
    }

    private void recordWrong(
            Attempt attempt,
            Instant outcomeAt,
            Map<Long, WrongNote> wrongNotesByQuestionId) {
        Long questionId = attempt.getQuestion().getId();
        WrongNote wrongNote = wrongNotesByQuestionId.computeIfAbsent(
                questionId, ignored -> WrongNote.open(attempt.getQuestion(), attempt, outcomeAt));
        wrongNote.recordWrong(attempt, outcomeAt);
        wrongNotesByQuestionId.put(questionId, wrongNoteRepository.save(wrongNote));
    }

    private ReviewSchedule findOrCreateSchedule(
            Attempt attempt,
            Instant outcomeAt,
            boolean reviewNeeded,
            Map<Long, ReviewSchedule> schedulesByQuestionId) {
        return schedulesByQuestionId.computeIfAbsent(
                attempt.getQuestion().getId(),
                ignored -> ReviewSchedule.start(attempt.getQuestion(), reviewNeeded ? attempt : null, outcomeAt));
    }
}
