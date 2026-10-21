package com.guseoh.csforge.dashboard.application;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.guseoh.csforge.dashboard.infrastructure.LearningInsightsQueryRepository;
import com.guseoh.csforge.learning.application.ConceptUnderstandingPolicy;
import com.guseoh.csforge.learning.application.LearningQueryService;
import com.guseoh.csforge.learning.infrastructure.ConceptUnderstandingBatchRepository;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 학습 기간을 study timezone의 날짜로 고정해 조회 전용 진단을 구성한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LearningInsightsQueryService {

    private static final int MIN_COMPARABLE_QUESTIONS = 3;
    private static final int MAX_CANDIDATES = 10;
    private static final int MAX_WEAK_CONCEPTS = 5;

    private final LearningInsightsQueryRepository repository;
    private final ConceptUnderstandingBatchRepository understandingRepository;
    private final LearningQueryService learningQueryService;
    private final Clock clock;
    private final ZoneId studyZoneId;

    public LearningInsightsView getInsights(String range, String areaSlug) {
        int days = switch (range) {
            case "7d" -> 7;
            case "30d" -> 30;
            default -> throw new IllegalArgumentException("range must be 7d or 30d");
        };
        String area = areaSlug == null || areaSlug.isBlank() ? null : areaSlug;
        if (area != null) learningQueryService.getArea(area);

        Instant asOf = Instant.now(clock);
        LocalDate today = asOf.atZone(studyZoneId).toLocalDate();
        LocalDate fromDay = today.minusDays(days - 1L);
        LocalDate previousDay = fromDay.minusDays(days);
        Instant from = fromDay.atStartOfDay(studyZoneId).toInstant();
        Instant previousFrom = previousDay.atStartOfDay(studyZoneId).toInstant();
        // Exclusive upper bound includes all recorded activity up to the query instant.
        Instant until = asOf.plusNanos(1);

        LearningInsightsView.Period current = period(fromDay, today, from, until, area);
        LearningInsightsView.Period previous = period(previousDay, fromDay.minusDays(1), previousFrom, from, area);
        boolean comparable = current.uniqueQuestions() >= MIN_COMPARABLE_QUESTIONS
                && previous.uniqueQuestions() >= MIN_COMPARABLE_QUESTIONS;
        String reason = comparable ? "기간별 풀이 활동의 차이이며 인과적 학습 성장 판정은 아닙니다."
                : "각 기간에 서로 다른 확정 문제 3개 이상이 필요하므로 추세를 판단하기 어렵습니다.";

        Tuple reviews = repository.reviewDue(asOf, today.atStartOfDay(studyZoneId).toInstant(), area);
        List<Tuple> candidates = repository.weakCandidates(from, until, area, MAX_CANDIDATES);
        List<Long> ids = candidates.stream().map(row -> row.get("conceptId", Long.class)).toList();
        Map<Long, Object[]> evidence = understandingRepository.summarizeConceptIds(ids).stream()
                .collect(Collectors.toMap(row -> ((Number) row[0]).longValue(), Function.identity()));
        Map<Long, Long> due = repository.dueByConcept(ids, asOf).stream()
                .collect(Collectors.toMap(row -> row.get("conceptId", Long.class), row -> row.get("due", Long.class)));
        List<LearningInsightsView.WeakConcept> weakConcepts = candidates.stream().limit(MAX_WEAK_CONCEPTS).map(row -> {
            long id = row.get("conceptId", Long.class);
            Object[] sample = evidence.get(id);
            int distinct = sample == null ? 0 : ((Number) sample[3]).intValue();
            int correct = sample == null ? 0 : ((Number) sample[4]).intValue();
            return new LearningInsightsView.WeakConcept(
                    id, row.get("title", String.class), row.get("areaSlug", String.class),
                    row.get("areaName", String.class), row.get("wrongAttempts", Long.class),
                    due.getOrDefault(id, 0L), row.get("lastWrongAt", Instant.class),
                    distinct, correct,
                    distinct < ConceptUnderstandingPolicy.MIN_UNIQUE_QUESTIONS ? null : correct * 100.0 / distinct,
                    ConceptUnderstandingPolicy.classify(distinct, correct).name());
        }).toList();

        return new LearningInsightsView(asOf, today, studyZoneId.getId(), range, area,
                current, previous, comparable, reason,
                reviews.get("overdue", Long.class), reviews.get("today", Long.class), weakConcepts);
    }

    private LearningInsightsView.Period period(LocalDate first, LocalDate last,
                                               Instant from, Instant until, String area) {
        Tuple summary = repository.attemptSummary(from, until, area);
        long finalized = summary.get("finalized", Long.class);
        long correct = summary.get("correct", Long.class);
        return new LearningInsightsView.Period(first, last, finalized, correct,
                summary.get("wrong", Long.class), summary.get("questions", Long.class),
                summary.get("pending", Long.class), repository.viewedConcepts(from, until, area),
                finalized == 0 ? null : correct * 100.0 / finalized);
    }
}
