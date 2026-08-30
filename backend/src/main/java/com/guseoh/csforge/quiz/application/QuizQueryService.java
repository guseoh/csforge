package com.guseoh.csforge.quiz.application;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

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
        return resultCalculator.calculate(data);
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
