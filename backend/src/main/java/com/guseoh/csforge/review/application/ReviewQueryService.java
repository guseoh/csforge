package com.guseoh.csforge.review.application;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.question.domain.QuestionConceptRepository;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.review.infrastructure.ReviewScheduleSearchRepository;

/**
 * 복습 요약과 bounded 일정 목록 조회를 처리한다.
 */
@Service
@RequiredArgsConstructor
public class ReviewQueryService {

    private final ReviewScheduleRepository scheduleRepository;
    private final ReviewScheduleSearchRepository searchRepository;
    private final QuestionConceptRepository conceptRepository;
    private final Clock clock;
    private final ZoneId studyZoneId;

    @Transactional(readOnly = true)
    public ReviewSummaryView summary() {
        ReviewTimeWindow timeWindow = ReviewTimeWindow.from(Instant.now(clock), studyZoneId);
        long overdue = scheduleRepository.countByStatusAndDueAtBefore(ReviewScheduleStatus.SCHEDULED, timeWindow.startOfToday());
        long actionable = scheduleRepository.countScheduledDueBefore(ReviewScheduleStatus.SCHEDULED, timeWindow.now());
        long dueNow = actionable - overdue;
        long next24 = scheduleRepository.countScheduledDueBetweenExclusiveInclusive(
                ReviewScheduleStatus.SCHEDULED, timeWindow.now(), timeWindow.next24Hours());
        long next7 = scheduleRepository.countScheduledDueBetweenExclusiveInclusive(
                ReviewScheduleStatus.SCHEDULED, timeWindow.next24Hours(), timeWindow.next7Days());
        return new ReviewSummaryView(overdue, dueNow, next24, next7,
                scheduleRepository.countByStatus(ReviewScheduleStatus.MASTERED));
    }

    @Transactional(readOnly = true)
    public ReviewPageView list(ReviewListCriteria criteria, int page, int size) {
        ReviewListCriteria timedCriteria = criteria.at(ReviewTimeWindow.from(Instant.now(clock), studyZoneId));
        Page<ReviewSchedule> result = searchRepository.search(timedCriteria, PageRequest.of(page, size));
        List<Long> ids = result.getContent().stream().map(ReviewSchedule::getQuestionId).toList();
        Map<Long, List<QuestionConcept>> concepts = conceptRepository.findForQuestionIds(ids).stream()
                .collect(Collectors.groupingBy(item -> item.getQuestion().getId()));
        return new ReviewPageView(
                result.getContent().stream().map(schedule -> toItem(schedule, concepts.getOrDefault(schedule.getQuestionId(), List.of()))).toList(),
                result.getTotalElements(), page, size);
    }

    private ReviewListItemView toItem(ReviewSchedule schedule, List<QuestionConcept> links) {
        var question = schedule.getQuestion();
        return new ReviewListItemView(question.getId(), question.getPromptMarkdown(), question.getQuestionType(), question.getDifficulty(),
                links.stream().map(link -> {
                    var concept = link.getConcept();
                    var topic = concept.getTopic();
                    var area = topic.getLearningArea();
                    return new ReviewListItemView.ConceptView(concept.getId(), concept.getSlug(), concept.getTitle(), area.getSlug(), area.getName(), concept.getLevel());
                }).toList(), schedule.getStatus(), schedule.getStage(), schedule.getDueAt(), schedule.getLastReviewedAt());
    }
}
