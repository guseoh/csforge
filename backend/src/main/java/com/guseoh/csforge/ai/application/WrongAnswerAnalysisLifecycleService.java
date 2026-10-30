package com.guseoh.csforge.ai.application;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import com.guseoh.csforge.ai.config.AiAnalysisProperties;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysis;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisRepository;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** durable analysis row의 claim, completion, retry/failure를 짧은 transaction으로 수행한다. */
@Service
@RequiredArgsConstructor
public class WrongAnswerAnalysisLifecycleService {

    private final WrongAnswerAnalysisRepository repository;
    private final AiAnalysisProperties properties;

    @Transactional
    public Optional<WrongAnswerAnalysisWorkItem> claim(long analysisId, Instant now) {
        Instant staleBefore = now.minus(properties.getProcessingLease());
        return repository.findByIdForUpdate(analysisId)
                .filter(analysis -> analysis.isRunnable(now, staleBefore))
                .map(analysis -> {
                    String token = UUID.randomUUID().toString();
                    if (analysis.getStatus() == WrongAnswerAnalysisStatus.PENDING) {
                        analysis.claim(token, now);
                    } else {
                        analysis.reclaim(token, now, staleBefore);
                    }
                    return new WrongAnswerAnalysisWorkItem(
                            analysis.getId(),
                            analysis.getAttempt().getId(),
                            token,
                            analysis.getInputSnapshot());
                });
    }

    @Transactional
    public boolean complete(long analysisId, String token, String result, Instant completedAt) {
        return repository.findByIdForUpdate(analysisId)
                .filter(analysis -> analysis.ownsProcessing(token))
                .map(analysis -> {
                    analysis.complete(token, result, completedAt);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public FailureResult fail(
            long analysisId,
            String token,
            String errorCode,
            String errorMessage,
            boolean retryable,
            Instant failedAt) {
        return repository.findByIdForUpdate(analysisId)
                .filter(analysis -> analysis.ownsProcessing(token))
                .map(analysis -> {
                    boolean willRetry = retryable
                            && analysis.getProcessingAttemptCount() < properties.getMaxProcessingAttempts();
                    Instant nextAttemptAt = willRetry ? failedAt.plus(backoff(analysis.getProcessingAttemptCount())) : null;
                    analysis.fail(
                            token,
                            errorCode,
                            errorMessage,
                            retryable,
                            properties.getMaxProcessingAttempts(),
                            failedAt,
                            nextAttemptAt);
                    return new FailureResult(true, analysis.getStatus().name(), analysis.getProcessingAttemptCount());
                })
                .orElseGet(() -> new FailureResult(false, null, 0));
    }

    private Duration backoff(int attemptCount) {
        long multiplier = 1L << Math.min(Math.max(attemptCount - 1, 0), 20);
        Duration candidate = properties.getRetryInitialDelay().multipliedBy(multiplier);
        return candidate.compareTo(properties.getRetryMaxDelay()) > 0
                ? properties.getRetryMaxDelay()
                : candidate;
    }

    /** lifecycle mutation이 실제 owner row에 적용되었는지와 결과 상태를 표현한다. */
    public record FailureResult(boolean applied, String status, int attemptCount) {
    }
}
