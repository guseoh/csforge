package com.guseoh.csforge.quiz.application;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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
 * 선택된 문제 순서와 source로 퀴즈 세션 및 초기 Attempt를 생성한다.
 */
@Component
@RequiredArgsConstructor
public class QuizSessionCreator {

    private final QuizSessionRepository sessionRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;

    public QuizCreatedResult create(
            List<Long> questionIds,
            Instant startedAt,
            Instant expiresAt,
            QuizSessionSource source) {
        return create(questionIds, startedAt, expiresAt, source, null);
    }

    public QuizCreatedResult create(
            List<Long> questionIds,
            Instant startedAt,
            Instant expiresAt,
            QuizSessionSource source,
            QuizCreationIdentity creationIdentity) {
        Optional<QuizCreatedResult> existing = findExisting(creationIdentity);
        if (existing.isPresent()) return existing.get();

        if (questionIds == null || questionIds.isEmpty()) {
            throw new IllegalArgumentException("questionIds must not be empty");
        }
        QuizSession session = sessionRepository.saveAndFlush(QuizSession.start(
                startedAt,
                expiresAt,
                source,
                creationIdentity == null ? null : creationIdentity.requestId(),
                creationIdentity == null ? null : creationIdentity.fingerprint()));
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

    public Optional<QuizCreatedResult> findExisting(QuizCreationIdentity creationIdentity) {
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
}
