package com.guseoh.csforge.ai.application;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.ai.config.AiAnalysisProperties;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysis;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisRepository;
import com.guseoh.csforge.ai.domain.WrongAnswerAnalysisStatus;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** current lastWrongAttempt에 귀속된 분석 상태와 검증 결과를 조회한다. */
@Service
@RequiredArgsConstructor
public class WrongAnswerAnalysisQueryService {

    private final WrongNoteRepository wrongNoteRepository;
    private final WrongAnswerAnalysisRepository analysisRepository;
    private final ConceptRepository conceptRepository;
    private final ObjectProvider<WrongAnswerAnalyzer> analyzerProvider;
    private final AiAnalysisProperties properties;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public WrongAnswerAnalysisView current(long questionId) {
        WrongNote wrongNote = wrongNoteRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new com.guseoh.csforge.wrongnote.application.WrongNoteNotFoundException());
        Attempt attempt = wrongNote.getLastWrongAttempt();
        boolean providerConfigured = isProviderConfigured();
        if (attempt == null) {
            return notRequested(questionId, null, providerConfigured);
        }
        WrongAnswerAnalysis analysis = analysisRepository.findByAttemptId(attempt.getId()).orElse(null);
        if (analysis == null) return notRequested(questionId, attempt.getId(), providerConfigured);
        WrongAnswerAnalysisResult result = analysis.getStatus() == WrongAnswerAnalysisStatus.COMPLETED
                ? deserializeResult(analysis.getResult())
                : null;
        WrongAnswerAnalysisReadStatus readStatus = !providerConfigured
                && analysis.getStatus() != WrongAnswerAnalysisStatus.COMPLETED
                        ? WrongAnswerAnalysisReadStatus.PROVIDER_NOT_CONFIGURED
                        : toReadStatus(analysis.getStatus());
        return new WrongAnswerAnalysisView(
                questionId,
                attempt.getId(),
                readStatus,
                providerConfigured,
                providerConfigured,
                analysis.getStatus() == WrongAnswerAnalysisStatus.FAILED && providerConfigured,
                result,
                result == null ? List.of() : resolveConcepts(result.relatedConceptKeys()),
                analysis.getRequestedAt(),
                analysis.getStartedAt(),
                analysis.getCompletedAt(),
                analysis.getFailedAt(),
                analysis.getErrorCode(),
                analysis.getErrorMessage());
    }

    private WrongAnswerAnalysisView notRequested(long questionId, Long attemptId, boolean providerConfigured) {
        return new WrongAnswerAnalysisView(
                questionId,
                attemptId,
                providerConfigured
                        ? WrongAnswerAnalysisReadStatus.NOT_REQUESTED
                        : WrongAnswerAnalysisReadStatus.PROVIDER_NOT_CONFIGURED,
                providerConfigured,
                providerConfigured,
                false,
                null,
                List.of(),
                null,
                null,
                null,
                null,
                null,
                null);
    }

    private boolean isProviderConfigured() {
        WrongAnswerAnalyzer analyzer = analyzerProvider.getIfAvailable();
        return properties.isEnabled() && analyzer != null && analyzer.isConfigured();
    }

    private WrongAnswerAnalysisResult deserializeResult(String json) {
        if (json == null || json.isBlank()) throw new IllegalStateException("Completed analysis has no result");
        try {
            return objectMapper.readValue(json, WrongAnswerAnalysisResult.class);
        } catch (Exception exception) {
            throw new IllegalStateException("Completed analysis result could not be read", exception);
        }
    }

    private List<WrongAnswerAnalysisView.RelatedConceptView> resolveConcepts(List<String> keys) {
        if (keys == null || keys.isEmpty()) return List.of();
        Map<String, Concept> concepts = new LinkedHashMap<>();
        conceptRepository.findByContentKeyIn(keys).forEach(concept -> concepts.put(concept.getContentKey(), concept));
        return keys.stream()
                .map(concepts::get)
                .filter(java.util.Objects::nonNull)
                .map(this::toConceptView)
                .toList();
    }

    private WrongAnswerAnalysisView.RelatedConceptView toConceptView(Concept concept) {
        var area = concept.getTopic().getLearningArea();
        return new WrongAnswerAnalysisView.RelatedConceptView(
                concept.getId(),
                concept.getContentKey(),
                concept.getSlug(),
                concept.getTitle(),
                area.getSlug(),
                area.getName(),
                concept.getLevel());
    }

    private static WrongAnswerAnalysisReadStatus toReadStatus(WrongAnswerAnalysisStatus status) {
        return switch (status) {
            case PENDING -> WrongAnswerAnalysisReadStatus.PENDING;
            case PROCESSING -> WrongAnswerAnalysisReadStatus.PROCESSING;
            case COMPLETED -> WrongAnswerAnalysisReadStatus.COMPLETED;
            case FAILED -> WrongAnswerAnalysisReadStatus.FAILED;
        };
    }
}
