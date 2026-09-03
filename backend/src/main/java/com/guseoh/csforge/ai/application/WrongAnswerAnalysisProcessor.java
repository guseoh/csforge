package com.guseoh.csforge.ai.application;

import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.ai.config.AiAnalysisProperties;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/** PostgreSQL lifecycle row를 durable work source로 사용해 AI 분석을 처리하고 복구한다. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "csforge.ai.enabled", havingValue = "true")
public class WrongAnswerAnalysisProcessor {

    private final WrongAnswerAnalysisRepository repository;
    private final WrongAnswerAnalysisLifecycleService lifecycleService;
    private final WrongAnswerAnalysisResultValidator resultValidator;
    private final ObjectProvider<WrongAnswerAnalyzer> analyzerProvider;
    private final AiAnalysisProperties properties;
    private final ObjectMapper objectMapper;
    private final java.time.Clock clock;

    @Scheduled(fixedDelayString = "${csforge.ai.processor-delay-ms:1000}")
    public void processDueWork() {
        WrongAnswerAnalyzer analyzer = analyzerProvider.getIfAvailable();
        if (analyzer == null || !analyzer.isConfigured()) return;
        Instant now = Instant.now(clock);
        List<Long> ids = repository.findRunnableIds(
                com.guseoh.csforge.ai.domain.WrongAnswerAnalysisStatus.PENDING,
                com.guseoh.csforge.ai.domain.WrongAnswerAnalysisStatus.PROCESSING,
                now,
                now.minus(properties.getProcessingLease()),
                PageRequest.of(0, properties.getProcessorBatchSize()));
        ids.forEach(id -> processOne(id, analyzer));
    }

    private void processOne(long analysisId, WrongAnswerAnalyzer analyzer) {
        WrongAnswerAnalysisWorkItem work = lifecycleService.claim(analysisId, Instant.now(clock)).orElse(null);
        if (work == null) return;
        WrongAnswerAnalysisInputSnapshot snapshot;
        try {
            snapshot = objectMapper.readValue(work.inputSnapshot(), WrongAnswerAnalysisInputSnapshot.class);
        } catch (Exception exception) {
            fail(work, "AI_SNAPSHOT_INVALID", "Stored analysis input is invalid", false);
            return;
        }
        try {
            WrongAnswerAnalysisResult result = analyzer.analyze(snapshot);
            WrongAnswerAnalysisResult validated = resultValidator.validate(result, snapshot);
            String resultJson = objectMapper.writeValueAsString(validated);
            boolean completed = lifecycleService.complete(
                    work.analysisId(), work.processingToken(), resultJson, Instant.now(clock));
            if (!completed) {
                log.debug("Ignored stale AI analysis completion analysisId={} attemptId={}", work.analysisId(), work.attemptId());
            }
        } catch (WrongAnswerAnalysisProviderException exception) {
            fail(work, exception.errorCode(), exception.getMessage(), exception.retryable());
        } catch (WrongAnswerAnalysisInvalidOutputException exception) {
            fail(work, "AI_INVALID_OUTPUT", exception.getMessage(), false);
        } catch (Exception exception) {
            fail(work, "AI_PROVIDER_ERROR", "AI provider request failed", true);
            log.warn("AI analysis provider error analysisId={} attemptId={}", work.analysisId(), work.attemptId(), exception);
        }
    }

    private void fail(WrongAnswerAnalysisWorkItem work, String errorCode, String message, boolean retryable) {
        WrongAnswerAnalysisLifecycleService.FailureResult result = lifecycleService.fail(
                work.analysisId(),
                work.processingToken(),
                errorCode,
                message,
                retryable,
                Instant.now(clock));
        if (!result.applied()) {
            log.debug("Ignored stale AI analysis failure analysisId={} attemptId={}", work.analysisId(), work.attemptId());
            return;
        }
        log.warn(
                "AI analysis failed analysisId={} attemptId={} status={} attempt={} retryable={}",
                work.analysisId(), work.attemptId(), result.status(), result.attemptCount(), retryable);
    }
}
