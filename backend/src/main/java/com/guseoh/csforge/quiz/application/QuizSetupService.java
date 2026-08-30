package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizInvalidStateException;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.infrastructure.QuestionSelectionRepository;

/**
 * 퀴즈 생성과 최종 오답 재시작 유스케이스를 처리하는 애플리케이션 서비스이다.
 */
@Service
@RequiredArgsConstructor
public class QuizSetupService {

    private final QuestionSelectionRepository selectionRepository;
    private final QuizSessionDataLoader dataLoader;
    private final QuizSessionCreator sessionCreator;
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
        return sessionCreator.create(selection.questionIds(), startedAt, expiresAt, QuizSessionSource.STANDARD);
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
        return sessionCreator.create(wrongQuestionIds, Instant.now(clock), null, QuizSessionSource.WRONG_RETRY);
    }
}
