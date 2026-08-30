package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizInvalidStateException;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.infrastructure.QuestionSelectionRepository;

/**
 * 퀴즈 생성과 최종 오답 재시작 유스케이스를 처리하는 애플리케이션 서비스이다.
 */
@Service
@RequiredArgsConstructor
public class QuizSetupService {

    private final QuestionSelectionRepository selectionRepository;
    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final QuizSessionDataLoader dataLoader;
    private final Clock clock;

    @Transactional(readOnly = true)
    public long availability(QuizQuestionSelectionCriteria criteria) {
        return selectionRepository.count(criteria);
    }

    @Transactional
    public QuizCreatedResult create(QuizSetupRequest request) {
        QuestionSelectionResult selection = selectionRepository.select(request.criteria(), request.count());
        if (selection.availableCount() < request.count()) {
            throw new InsufficientQuestionsException(selection.availableCount(), request.count());
        }
        Instant startedAt = Instant.now(clock);
        Instant expiresAt = request.timeLimitSeconds() == null
                ? null
                : startedAt.plusSeconds(request.timeLimitSeconds());
        return persistNewSession(selection.questionIds(), startedAt, expiresAt);
    }

    @Transactional
    public QuizCreatedResult retryWrong(long quizId) {
        QuizSessionData data = dataLoader.loadForRetry(quizId);
        data.session().ensureResultAvailable();
        if (data.attemptsByQuestionId().values().stream()
                .anyMatch(attempt -> attempt.getGradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED)) {
            throw new QuizInvalidStateException("Complete all self-checks before retrying wrong questions");
        }

        List<Long> wrongQuestionIds = data.quizQuestions().stream()
                .map(item -> data.requireAttempt(item.getQuestion().getId()))
                .filter(Attempt::isWrong)
                .map(attempt -> attempt.getQuestion().getId())
                .toList();
        if (wrongQuestionIds.isEmpty()) {
            throw new NoWrongQuestionsException();
        }
        return persistNewSession(wrongQuestionIds, Instant.now(clock), null);
    }

    private QuizCreatedResult persistNewSession(List<Long> questionIds, Instant startedAt, Instant expiresAt) {
        QuizSession session = sessionRepository.saveAndFlush(QuizSession.start(startedAt, expiresAt));
        List<QuizQuestion> quizQuestions = new ArrayList<>(questionIds.size());
        for (int position = 0; position < questionIds.size(); position++) {
            Question question = questionRepository.getReferenceById(questionIds.get(position));
            quizQuestions.add(QuizQuestion.place(session, question, position));
        }
        quizQuestionRepository.saveAll(quizQuestions);
        attemptRepository.saveAll(quizQuestions.stream()
                .map(item -> Attempt.unanswered(session, item.getQuestion()))
                .toList());
        return new QuizCreatedResult(
                session.getId(),
                session.getStatus(),
                quizQuestions.size(),
                session.getStartedAt(),
                session.getExpiresAt(),
                session.getLastPosition());
    }
}
