package com.guseoh.csforge.ai.application;

import java.time.Clock;
import java.time.Instant;

import com.guseoh.csforge.ai.config.AiAnalysisProperties;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysis;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** Wrong Note의 current wrong Attempt에 대한 분석 요청과 명시적 retry를 조정한다. */
@Service
@RequiredArgsConstructor
public class WrongAnswerAnalysisCommandService {

    private final WrongNoteRepository wrongNoteRepository;
    private final WrongAnswerAnalysisRepository analysisRepository;
    private final WrongAnswerAnalysisSnapshotFactory snapshotFactory;
    private final AiAnalysisProperties properties;
    private final ObjectProvider<WrongAnswerAnalyzer> analyzerProvider;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    @Transactional
    public WrongAnswerAnalysisRequestResult request(long questionId) {
        ensureProviderConfigured();
        WrongNote wrongNote = wrongNoteRepository.findByQuestionIdForUpdate(questionId)
                .orElseThrow(() -> new com.guseoh.csforge.wrongnote.application.WrongNoteNotFoundException());
        Attempt attempt = requireCurrentWrongAttempt(wrongNote);
        return analysisRepository.findByAttemptId(attempt.getId())
                .map(existing -> new WrongAnswerAnalysisRequestResult(attempt.getId(), false))
                .orElseGet(() -> createAnalysis(wrongNote, attempt));
    }

    @Transactional
    public WrongAnswerAnalysisRequestResult retry(long questionId) {
        ensureProviderConfigured();
        WrongNote wrongNote = wrongNoteRepository.findByQuestionIdForUpdate(questionId)
                .orElseThrow(() -> new com.guseoh.csforge.wrongnote.application.WrongNoteNotFoundException());
        Attempt attempt = requireCurrentWrongAttempt(wrongNote);
        WrongAnswerAnalysis analysis = analysisRepository.findByAttemptId(attempt.getId())
                .orElseThrow(() -> new WrongAnswerAnalysisInvalidStateException("No failed analysis exists for the current attempt"));
        try {
            analysis.retry(Instant.now(clock));
        } catch (IllegalStateException exception) {
            throw new WrongAnswerAnalysisInvalidStateException(exception.getMessage());
        }
        return new WrongAnswerAnalysisRequestResult(attempt.getId(), false);
    }

    private WrongAnswerAnalysisRequestResult createAnalysis(WrongNote wrongNote, Attempt attempt) {
        WrongAnswerAnalysisInputSnapshot snapshot = snapshotFactory.create(wrongNote);
        WrongAnswerAnalysis analysis = WrongAnswerAnalysis.pending(
                wrongNote,
                attempt,
                serialize(snapshot),
                properties.getProvider(),
                properties.getModel(),
                properties.getPromptVersion(),
                properties.getSchemaVersion(),
                Instant.now(clock));
        analysisRepository.save(analysis);
        return new WrongAnswerAnalysisRequestResult(attempt.getId(), true);
    }

    private Attempt requireCurrentWrongAttempt(WrongNote wrongNote) {
        Attempt attempt = wrongNote.getLastWrongAttempt();
        if (attempt == null || !attempt.isFinalized() || !attempt.isWrong()) {
            throw new WrongAnswerAnalysisEligibilityException("Current latest attempt is not a finalized wrong attempt");
        }
        if (attempt.getQuestion() == null
                || !wrongNote.getQuestion().getId().equals(attempt.getQuestion().getId())) {
            throw new WrongAnswerAnalysisEligibilityException("Current latest attempt does not belong to this question");
        }
        return attempt;
    }

    private void ensureProviderConfigured() {
        WrongAnswerAnalyzer analyzer = analyzerProvider.getIfAvailable();
        if (!properties.isEnabled() || analyzer == null || !analyzer.isConfigured()) {
            throw new AiProviderNotConfiguredException();
        }
    }

    private String serialize(WrongAnswerAnalysisInputSnapshot snapshot) {
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (Exception exception) {
            throw new IllegalStateException("AI analysis snapshot could not be serialized", exception);
        }
    }
}
