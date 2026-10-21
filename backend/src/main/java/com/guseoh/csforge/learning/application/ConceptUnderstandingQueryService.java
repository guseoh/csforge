package com.guseoh.csforge.learning.application;

import java.util.List;

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
}
