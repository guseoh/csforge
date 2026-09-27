package com.guseoh.csforge.quiz.application;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import com.guseoh.csforge.quiz.domain.QuizSessionSource;

/**
 * 퀴즈 생성 키를 조정하고 중복 생성 경쟁을 복구한다.
 */
@Component
@RequiredArgsConstructor
public class QuizSessionCreator {

    private final QuizSessionCreationExecutor creationExecutor;

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
        if (existing.isPresent()) return existing.orElseThrow();

        if (creationIdentity == null) {
            return creationExecutor.create(questionIds, startedAt, expiresAt, source);
        }

        try {
            return creationExecutor.createWithIdentity(
                    questionIds,
                    startedAt,
                    expiresAt,
                    source,
                    creationIdentity);
        } catch (QuizSessionCreationRaceException collision) {
            Optional<QuizCreatedResult> winner = creationExecutor.findExistingAfterConflict(creationIdentity);
            if (winner.isEmpty()) throw collision;
            return winner.orElseThrow();
        }
    }

    public Optional<QuizCreatedResult> findExisting(QuizCreationIdentity creationIdentity) {
        return creationExecutor.findExisting(creationIdentity);
    }
}
