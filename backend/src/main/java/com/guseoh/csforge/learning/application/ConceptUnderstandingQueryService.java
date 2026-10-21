package com.guseoh.csforge.learning.application;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.sql.Timestamp;

import com.guseoh.csforge.learning.infrastructure.ConceptUnderstandingBatchRepository;

import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.ConceptProgressRepository;
import com.guseoh.csforge.learning.domain.LearningStatus;
import com.guseoh.csforge.learning.infrastructure.ConceptUnderstandingEvidenceRepository;
import com.guseoh.csforge.quiz.domain.AttemptGradingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 저장된 답안만 조회하여 Concept의 최근 문제 근거를 계산한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConceptUnderstandingQueryService {

    private final ConceptRepository conceptRepository;
    private final ConceptProgressRepository progressRepository;
    private final ConceptUnderstandingEvidenceRepository evidenceRepository;
    private final ConceptUnderstandingBatchRepository batchRepository;
    private final LearningQueryService learningQueryService;

    public ConceptUnderstandingView getUnderstanding(long conceptId) {
        conceptRepository.findPublishedById(conceptId)
                .orElseThrow(() -> new LearningNotFoundException("Published concept not found: " + conceptId));
        LearningStatus learningStatus = progressRepository.findById(conceptId)
                .map(progress -> progress.getStatus())
                .orElse(LearningStatus.UNSEEN);

        List<ConceptUnderstandingCount> totals = evidenceRepository.countByGradingStatus(conceptId);
        long finalizedAttempts = totals.stream()
                .filter(row -> row.gradingStatus() == AttemptGradingStatus.GRADED
                        || row.gradingStatus() == AttemptGradingStatus.SELF_CHECKED)
                .mapToLong(ConceptUnderstandingCount::count)
                .sum();
        long pendingSelfCheck = totals.stream()
                .filter(row -> row.gradingStatus() == AttemptGradingStatus.SELF_CHECK_REQUIRED)
                .mapToLong(ConceptUnderstandingCount::count)
                .sum();
        List<ConceptUnderstandingEvidence> recent = evidenceRepository.findLatestFinalizedDistinctQuestions(
                conceptId, PageRequest.of(0, ConceptUnderstandingPolicy.RECENT_DISTINCT_QUESTIONS));
        int questionCount = recent.size();
        int correctCount = (int) recent.stream().filter(row -> Boolean.TRUE.equals(row.correct())).count();
        Double accuracy = questionCount == 0 ? null : correctCount * 100.0 / questionCount;

        return new ConceptUnderstandingView(
                conceptId,
                learningStatus,
                new ConceptUnderstandingView.Evidence(questionCount, finalizedAttempts, correctCount, pendingSelfCheck),
                accuracy,
                ConceptUnderstandingPolicy.classify(questionCount, correctCount),
                recent.isEmpty() ? null : recent.getFirst().gradedAt());
    }

    public ConceptUnderstandingPageView getAreaUnderstanding(String areaSlug, Long topicId, int page, int size) {
        if (size > 50) throw new LearningBadRequestException("size must be between 1 and 50");
        learningQueryService.getArea(areaSlug);
        ConceptPageView concepts = learningQueryService.listConcepts(new ConceptSearchCriteria(
                areaSlug, topicId, null, null, null, null, page, size, ConceptSort.CURRICULUM));
        List<Long> ids = concepts.items().stream().map(ConceptSearchItem::id).toList();
        if (ids.isEmpty()) return new ConceptUnderstandingPageView(List.of(), concepts.page());

        Map<Long, Object[]> summaryById = batchRepository.summarizeConceptIds(ids).stream()
                .collect(Collectors.toMap(row -> ((Number) row[0]).longValue(), Function.identity()));
        List<ConceptUnderstandingView> items = concepts.items().stream().map(item -> {
            Object[] row = summaryById.get(item.id());
            long finalized = row == null ? 0L : ((Number) row[1]).longValue();
            long pending = row == null ? 0L : ((Number) row[2]).longValue();
            int sampled = row == null ? 0 : ((Number) row[3]).intValue();
            int correct = row == null ? 0 : ((Number) row[4]).intValue();
            return new ConceptUnderstandingView(item.id(), item.learningStatus(),
                    new ConceptUnderstandingView.Evidence(sampled, finalized, correct, pending),
                    sampled == 0 ? null : correct * 100.0 / sampled,
                    ConceptUnderstandingPolicy.classify(sampled, correct),
                    row == null ? null : toInstant(row[5]));
        }).toList();
        return new ConceptUnderstandingPageView(items, concepts.page());
    }

    private static Instant toInstant(Object value) {
        if (value == null) return null;
        if (value instanceof Instant instant) return instant;
        if (value instanceof OffsetDateTime offset) return offset.toInstant();
        if (value instanceof Timestamp timestamp) return timestamp.toInstant();
        throw new IllegalStateException("Unsupported database timestamp type: " + value.getClass().getName());
    }
}
