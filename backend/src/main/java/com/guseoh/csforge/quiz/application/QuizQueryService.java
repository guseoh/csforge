package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionAttemptSummary;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;

/**
 * 퀴즈 세션과 결과를 조회하는 유스케이스를 처리하는 애플리케이션 서비스이다.
 */
@Service
@RequiredArgsConstructor
public class QuizQueryService {

    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuizSessionDataLoader dataLoader;
    private final QuizResultCalculator resultCalculator;
    private final WrongNoteRepository wrongNoteRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Optional<QuizActiveView> active() {
        return sessionRepository.findFirstByStatusOrderByStartedAtDescIdDesc(QuizSessionStatus.IN_PROGRESS)
                .map(this::toActiveView);
    }

    @Transactional(readOnly = true)
    public QuizSessionView session(long quizId) {
        QuizSessionData data = dataLoader.loadForSession(quizId);
        return new QuizSessionView(data, data.session().isExpired(Instant.now(clock)));
    }

    @Transactional(readOnly = true)
    public QuizResultView result(long quizId) {
        QuizSessionData data = dataLoader.loadForResult(quizId);
        data.session().ensureResultAvailable();
        return resultCalculator.calculate(data, questionOutcomes(data.quizQuestions().stream()
                .map(item -> item.getQuestion().getId())
                .toList()));
    }

    private Map<Long, QuizQuestionOutcomeView> questionOutcomes(List<Long> questionIds) {
        if (questionIds.isEmpty()) return Map.of();

        Map<Long, WrongNote> wrongNotes = wrongNoteRepository.findByQuestionIdIn(questionIds).stream()
                .collect(Collectors.toMap(note -> note.getQuestion().getId(), Function.identity()));
        Map<Long, ReviewSchedule> schedules = reviewScheduleRepository.findByQuestionIdIn(questionIds).stream()
                .collect(Collectors.toMap(ReviewSchedule::getQuestionId, Function.identity()));
        return questionIds.stream().collect(Collectors.toMap(
                Function.identity(),
                questionId -> new QuizQuestionOutcomeView(
                        questionId,
                        wrongNotes.containsKey(questionId),
                        Optional.ofNullable(schedules.get(questionId)).map(ReviewSchedule::getStatus).orElse(null))));
    }

    private static final List<QuizSessionStatus> HISTORY_STATUSES = List.of(
            QuizSessionStatus.SUBMITTED,
            QuizSessionStatus.COMPLETED);

    @Transactional(readOnly = true)
    public QuizHistoryPageView history(QuizSessionSource source, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<QuizSession> sessions = source == null
                ? sessionRepository.findByStatusInOrderByStartedAtDescIdDesc(HISTORY_STATUSES, pageable)
                : sessionRepository.findByStatusInAndSourceOrderByStartedAtDescIdDesc(HISTORY_STATUSES, source, pageable);
        List<Long> quizIds = sessions.getContent().stream().map(QuizSession::getId).toList();
        Map<Long, QuizSessionAttemptSummary> summaries = quizIds.isEmpty()
                ? Map.of()
                : attemptRepository.summarizeByQuizSessionIds(quizIds).stream()
                        .collect(Collectors.toMap(QuizSessionAttemptSummary::quizId, Function.identity()));
        List<QuizHistoryItemView> items = sessions.getContent().stream()
                .map(session -> toHistoryItem(session, summaries.get(session.getId())))
                .toList();
        return new QuizHistoryPageView(items, sessions.getTotalElements(), page, size);
    }

    private QuizHistoryItemView toHistoryItem(QuizSession session, QuizSessionAttemptSummary summary) {
        long total = summary == null ? 0L : summary.totalCount();
        long correct = summary == null ? 0L : summary.correctCount();
        long wrong = summary == null ? 0L : summary.wrongCount();
        long unanswered = summary == null ? 0L : summary.unansweredCount();
        long pending = summary == null ? 0L : summary.selfCheckPendingCount();
        QuizPerformance performance = new QuizPerformance(total, correct, wrong, unanswered, pending);
        return new QuizHistoryItemView(
                session.getId(),
                session.getStatus(),
                session.getSource(),
                Math.toIntExact(total),
                Math.toIntExact(correct),
                Math.toIntExact(wrong),
                Math.toIntExact(unanswered),
                Math.toIntExact(pending),
                performance.accuracy(),
                session.getStartedAt(),
                session.getSubmittedAt(),
                session.getCompletedAt());
    }

    private QuizActiveView toActiveView(QuizSession session) {
        long quizId = session.getId();
        return new QuizActiveView(
                quizId,
                Math.toIntExact(quizQuestionRepository.countByQuizSession_Id(quizId)),
                Math.toIntExact(attemptRepository.countByQuizSession_IdAndAnsweredAtIsNotNull(quizId)),
                session.getLastPosition(),
                session.getStartedAt(),
                session.getExpiresAt());
    }
}
