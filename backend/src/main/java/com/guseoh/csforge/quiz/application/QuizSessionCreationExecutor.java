package com.guseoh.csforge.quiz.application;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.quiz.domain.QuizQuestion;
import com.guseoh.csforge.quiz.domain.QuizQuestionRepository;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionSource;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;

/**
 * 퀴즈 세션과 초기 Attempt의 저장 및 생성 키 조회 트랜잭션을 담당한다.
 */
@Component
@RequiredArgsConstructor
public class QuizSessionCreationExecutor {

    private static final String CREATION_REQUEST_CONSTRAINT = "quiz_session_creation_request_id_uk";

    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    public QuizCreatedResult create(
            List<Long> questionIds,
            Instant startedAt,
            Instant expiresAt,
            QuizSessionSource source) {
        return persist(questionIds, startedAt, expiresAt, source, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public QuizCreatedResult createWithIdentity(
            List<Long> questionIds,
            Instant startedAt,
            Instant expiresAt,
            QuizSessionSource source,
            QuizCreationIdentity creationIdentity) {
        return persist(questionIds, startedAt, expiresAt, source, creationIdentity);
    }

    @Transactional(readOnly = true)
    public Optional<QuizCreatedResult> findExisting(QuizCreationIdentity creationIdentity) {
        return findByIdentity(creationIdentity);
    }

    @Transactional(readOnly = true, propagation = Propagation.REQUIRES_NEW)
    public Optional<QuizCreatedResult> findExistingAfterConflict(QuizCreationIdentity creationIdentity) {
        return findByIdentity(creationIdentity);
    }

    private QuizCreatedResult persist(
            List<Long> questionIds,
            Instant startedAt,
            Instant expiresAt,
            QuizSessionSource source,
            QuizCreationIdentity creationIdentity) {
        if (questionIds == null || questionIds.isEmpty()) {
            throw new IllegalArgumentException("questionIds must not be empty");
        }

        QuizSession session;
        try {
            session = sessionRepository.saveAndFlush(QuizSession.start(
                    startedAt,
                    expiresAt,
                    source,
                    creationIdentity == null ? null : creationIdentity.requestId(),
                    creationIdentity == null ? null : creationIdentity.fingerprint()));
        } catch (DataIntegrityViolationException exception) {
            if (isCreationRequestCollision(exception)) {
                throw new QuizSessionCreationRaceException(exception);
            }
            throw exception;
        }

        List<QuizQuestion> quizQuestions = new ArrayList<>(questionIds.size());
        for (int position = 0; position < questionIds.size(); position++) {
            Question question = questionRepository.getReferenceById(questionIds.get(position));
            quizQuestions.add(QuizQuestion.place(session, question, position));
        }
        quizQuestionRepository.saveAll(quizQuestions);
        attemptRepository.saveAll(quizQuestions.stream()
                .map(item -> Attempt.unanswered(session, item.getQuestion()))
                .toList());
        return toCreatedResult(session, quizQuestions.size());
    }

    private Optional<QuizCreatedResult> findByIdentity(QuizCreationIdentity creationIdentity) {
        if (creationIdentity == null) return Optional.empty();
        return sessionRepository.findByCreationRequestId(creationIdentity.requestId())
                .map(session -> {
                    if (!creationIdentity.fingerprint().equals(session.getCreationFingerprint())) {
                        throw new QuizCreationRequestConflictException();
                    }
                    int questionCount = Math.toIntExact(quizQuestionRepository.countByQuizSession_Id(session.getId()));
                    return toCreatedResult(session, questionCount);
                });
    }

    private QuizCreatedResult toCreatedResult(QuizSession session, int questionCount) {
        return new QuizCreatedResult(
                session.getId(),
                QuizSessionStatus.IN_PROGRESS,
                questionCount,
                session.getStartedAt(),
                session.getExpiresAt(),
                0,
                session.getSource());
    }

    private boolean isCreationRequestCollision(Throwable cause) {
        for (Throwable current = cause; current != null; current = current.getCause()) {
            if (current instanceof ConstraintViolationException violation
                    && CREATION_REQUEST_CONSTRAINT.equals(violation.getConstraintName())) {
                return true;
            }
        }
        return false;
    }
}
