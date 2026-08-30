package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.api.QuizCreatedResponse;
import com.guseoh.csforge.quiz.api.QuizRetryResponse;
import com.guseoh.csforge.quiz.infrastructure.QuestionSelectionRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.QuizInvalidStateException;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuizSetupService {

    private final QuestionSelectionRepository selectionRepository;
    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final QuizSessionDataLoader dataLoader;
    private final Clock clock;

    public QuizSetupService(
            QuestionSelectionRepository selectionRepository,
            QuizSessionRepository sessionRepository,
            QuizQuestionRepository quizQuestionRepository,
            AttemptRepository attemptRepository,
            QuestionRepository questionRepository,
            QuizSessionDataLoader dataLoader,
            Clock clock) {
        this.selectionRepository = selectionRepository;
        this.sessionRepository = sessionRepository;
        this.quizQuestionRepository = quizQuestionRepository;
        this.attemptRepository = attemptRepository;
        this.questionRepository = questionRepository;
        this.dataLoader = dataLoader;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public long availability(QuizQuestionSelectionCriteria criteria) {
        return selectionRepository.count(criteria);
    }

    @Transactional
    public QuizCreatedResponse create(QuizSetupRequest request) {
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
    public QuizRetryResponse retryWrong(long quizId) {
        QuizSessionData data = dataLoader.load(quizId);
        if (data.session().getStatus() == QuizSessionStatus.IN_PROGRESS) {
            throw new QuizInvalidStateException("Quiz must be submitted before retrying wrong questions");
        }
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
        QuizCreatedResponse created = persistNewSession(wrongQuestionIds, Instant.now(clock), null);
        return new QuizRetryResponse(
                created.quizId(), created.status(), created.questionCount(), created.startedAt(), created.expiresAt());
    }

    private QuizCreatedResponse persistNewSession(List<Long> questionIds, Instant startedAt, Instant expiresAt) {
        QuizSession session = sessionRepository.saveAndFlush(QuizSession.start(startedAt, expiresAt));
        List<QuizQuestion> quizQuestions = new ArrayList<>(questionIds.size());
        for (int position = 0; position < questionIds.size(); position++) {
            Question question = questionRepository.getReferenceById(questionIds.get(position));
            quizQuestions.add(QuizQuestion.place(session, question, position));
        }
        quizQuestionRepository.saveAllAndFlush(quizQuestions);
        List<Attempt> attempts = quizQuestions.stream()
                .map(item -> Attempt.unanswered(session, item.getQuestion()))
                .toList();
        attemptRepository.saveAllAndFlush(attempts);
        return new QuizCreatedResponse(
                session.getId(), session.getStatus(), quizQuestions.size(), session.getStartedAt(), session.getExpiresAt(),
                session.getLastPosition());
    }
}
