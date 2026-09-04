package com.guseoh.csforge.dashboard.application;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.dashboard.infrastructure.DashboardAreaProgressProjection;
import com.guseoh.csforge.dashboard.infrastructure.DashboardAttemptActivityProjection;
import com.guseoh.csforge.dashboard.infrastructure.DashboardConceptViewProjection;
import com.guseoh.csforge.dashboard.infrastructure.DashboardQueryRepository;
import com.guseoh.csforge.dashboard.infrastructure.DashboardQuizAttemptAggregateProjection;
import com.guseoh.csforge.dashboard.infrastructure.DashboardQuizQuestionCountProjection;
import com.guseoh.csforge.dashboard.infrastructure.DashboardWeakTopicProjection;
import com.guseoh.csforge.quiz.application.QuizActiveView;
import com.guseoh.csforge.quiz.application.QuizQueryService;
import com.guseoh.csforge.quiz.domain.QuizSession;
import com.guseoh.csforge.quiz.domain.QuizSessionRepository;
import com.guseoh.csforge.quiz.domain.QuizSessionStatus;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;

/** PostgreSQL 학습 이력을 daily-use Dashboard 조회 모델로 조합한다. */
@Service
@RequiredArgsConstructor
public class DashboardQueryService {

    private static final int HEATMAP_DAYS = 365;
    private static final int WEAK_TOPIC_DAYS = 30;
    private static final int MAX_WEAK_TOPICS = 5;

    private final DashboardQueryRepository dashboardQueryRepository;
    private final ReviewScheduleRepository reviewScheduleRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final QuizQueryService quizQueryService;
    private final Clock clock;
    private final ZoneId studyZoneId;

    @Transactional(readOnly = true)
    public DashboardView getDashboard() {
        Instant asOf = Instant.now(clock);
        LocalDate studyDate = asOf.atZone(studyZoneId).toLocalDate();
        Instant tomorrowStart = startOfDay(studyDate.plusDays(1));
        Instant heatmapStart = startOfDay(studyDate.minusDays(HEATMAP_DAYS - 1L));

        List<DashboardConceptViewProjection> viewEvents = dashboardQueryRepository
                .findConceptViews(heatmapStart, tomorrowStart);
        List<DashboardAttemptActivityProjection> attemptEvents = dashboardQueryRepository
                .findFinalizedAttempts(heatmapStart, tomorrowStart);
        Map<LocalDate, Activity> activityByDate = activities(viewEvents, attemptEvents);

        DashboardTodayView today = todayMetrics(activityByDate, studyDate,
                reviewScheduleRepository.countScheduledDueBefore(ReviewScheduleStatus.SCHEDULED, asOf));
        List<DashboardHeatmapDayView> heatmap = heatmap(activityByDate, studyDate);

        List<DashboardAreaProgressView> areaProgress = dashboardQueryRepository.findAreaProgress().stream()
                .map(this::toAreaProgress)
                .toList();
        List<DashboardWeakTopicView> weakTopics = findWeakTopics(asOf);
        List<DashboardRecentQuizView> recentQuizzes = findRecentQuizzes();
        DashboardActiveQuizView activeQuiz = quizQueryService.active()
                .map(this::toActiveQuiz)
                .orElse(null);

        return new DashboardView(
                asOf,
                studyDate,
                studyZoneId.getId(),
                today,
                currentStreak(activityByDate, studyDate),
                heatmap,
                areaProgress,
                weakTopics,
                recentQuizzes,
                activeQuiz);
    }

    private Map<LocalDate, Activity> activities(
            List<DashboardConceptViewProjection> viewEvents,
            List<DashboardAttemptActivityProjection> attemptEvents) {
        Map<LocalDate, Activity> activities = new HashMap<>();
        for (DashboardConceptViewProjection event : viewEvents) {
            activities.computeIfAbsent(toStudyDate(event.viewedAt()), ignored -> new Activity())
                    .conceptIds.add(event.conceptId());
        }
        for (DashboardAttemptActivityProjection event : attemptEvents) {
            Activity activity = activities.computeIfAbsent(toStudyDate(event.gradedAt()), ignored -> new Activity());
            activity.questionsSolved++;
            if (event.correct()) activity.correctCount++;
            else activity.wrongCount++;
        }
        return activities;
    }

    private DashboardTodayView todayMetrics(Map<LocalDate, Activity> activities, LocalDate studyDate,
            long reviewDueCount) {
        Activity activity = activities.getOrDefault(studyDate, new Activity());
        long solvedCount = activity.questionsSolved;
        double accuracy = solvedCount == 0 ? 0.0 : activity.correctCount * 100.0 / solvedCount;
        return new DashboardTodayView(
                solvedCount,
                activity.correctCount,
                activity.wrongCount,
                accuracy,
                reviewDueCount);
    }

    private List<DashboardHeatmapDayView> heatmap(Map<LocalDate, Activity> activities, LocalDate studyDate) {
        LocalDate firstDate = studyDate.minusDays(HEATMAP_DAYS - 1L);
        List<DashboardHeatmapDayView> days = new ArrayList<>(HEATMAP_DAYS);
        for (int offset = 0; offset < HEATMAP_DAYS; offset++) {
            LocalDate date = firstDate.plusDays(offset);
            Activity activity = activities.getOrDefault(date, new Activity());
            days.add(new DashboardHeatmapDayView(
                    date,
                    activity.conceptIds.size(),
                    activity.questionsSolved,
                    activity.conceptIds.size() + activity.questionsSolved));
        }
        return days;
    }

    private int currentStreak(Map<LocalDate, Activity> activities, LocalDate studyDate) {
        LocalDate cursor = studyDate;
        if (!hasActivity(activities, cursor)) {
            cursor = cursor.minusDays(1);
            if (!hasActivity(activities, cursor)) return 0;
        }

        int streak = 0;
        while (streak < HEATMAP_DAYS && hasActivity(activities, cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private List<DashboardWeakTopicView> findWeakTopics(Instant asOf) {
        Instant from = asOf.minus(WEAK_TOPIC_DAYS, ChronoUnit.DAYS);
        Map<Long, TopicActivity> topicActivities = new LinkedHashMap<>();
        Map<Long, Set<Long>> attemptsByTopic = new HashMap<>();
        for (DashboardWeakTopicProjection row : dashboardQueryRepository.findWeakTopicEvidence(from, asOf)) {
            Set<Long> attemptIds = attemptsByTopic.computeIfAbsent(row.topicId(), ignored -> new HashSet<>());
            if (!attemptIds.add(row.attemptId())) continue;

            TopicActivity activity = topicActivities.computeIfAbsent(row.topicId(), ignored -> new TopicActivity(
                    row.topicId(),
                    row.topicContentKey(),
                    row.topicTitle(),
                    row.areaSlug(),
                    row.areaName()));
            activity.attemptCount++;
            if (row.correct()) activity.correctCount++;
        }

        return topicActivities.values().stream()
                .filter(activity -> activity.attemptCount >= 3)
                .map(TopicActivity::toView)
                .sorted(Comparator
                        .comparingDouble(DashboardWeakTopicView::accuracyPercent)
                        .thenComparing(Comparator.comparingLong(DashboardWeakTopicView::wrongCount).reversed())
                        .thenComparing(Comparator.comparingLong(DashboardWeakTopicView::attemptCount).reversed())
                        .thenComparingLong(DashboardWeakTopicView::topicId))
                .limit(MAX_WEAK_TOPICS)
                .toList();
    }

    private List<DashboardRecentQuizView> findRecentQuizzes() {
        List<QuizSession> sessions = quizSessionRepository.findTop5ByStatusInOrderByStartedAtDescIdDesc(
                List.of(QuizSessionStatus.SUBMITTED, QuizSessionStatus.COMPLETED));
        if (sessions.isEmpty()) return List.of();

        List<Long> quizIds = sessions.stream().map(QuizSession::getId).toList();
        Map<Long, DashboardQuizAttemptAggregateProjection> aggregates = dashboardQueryRepository
                .findQuizAttemptAggregates(quizIds).stream()
                .collect(Collectors.toMap(
                        DashboardQuizAttemptAggregateProjection::quizId,
                        value -> value));
        Map<Long, DashboardQuizQuestionCountProjection> questionCounts = dashboardQueryRepository
                .findQuizQuestionCounts(quizIds).stream()
                .collect(Collectors.toMap(
                        DashboardQuizQuestionCountProjection::quizId,
                        value -> value));

        return sessions.stream()
                .map(session -> toRecentQuiz(session, aggregates.get(session.getId()), questionCounts.get(session.getId())))
                .toList();
    }

    private DashboardRecentQuizView toRecentQuiz(
            QuizSession session,
            DashboardQuizAttemptAggregateProjection aggregate,
            DashboardQuizQuestionCountProjection questionCount) {
        long finalizedCount = aggregate == null ? 0 : aggregate.finalizedCount();
        long correctCount = aggregate == null ? 0 : aggregate.correctCount();
        return new DashboardRecentQuizView(
                session.getId(),
                session.getSource(),
                session.getStatus(),
                session.getStartedAt(),
                session.getSubmittedAt(),
                session.getCompletedAt(),
                questionCount == null ? 0 : questionCount.questionCount(),
                finalizedCount,
                correctCount,
                aggregate == null ? 0 : aggregate.wrongCount(),
                aggregate == null ? 0 : aggregate.pendingSelfCheckCount(),
                finalizedCount == 0 ? 0.0 : correctCount * 100.0 / finalizedCount);
    }

    private DashboardAreaProgressView toAreaProgress(DashboardAreaProgressProjection area) {
        return new DashboardAreaProgressView(
                area.areaSlug(),
                area.areaName(),
                area.completedConceptCount(),
                area.publishedConceptCount(),
                percentage(area.completedConceptCount(), area.publishedConceptCount()),
                List.of(
                        level((short) 1, area.level1Completed(), area.level1Total()),
                        level((short) 2, area.level2Completed(), area.level2Total()),
                        level((short) 3, area.level3Completed(), area.level3Total())));
    }

    private DashboardLevelProgressView level(short level, long completed, long total) {
        return new DashboardLevelProgressView(level, completed, total, percentage(completed, total));
    }

    private DashboardActiveQuizView toActiveQuiz(QuizActiveView active) {
        return new DashboardActiveQuizView(
                active.quizId(),
                active.questionCount(),
                active.answeredCount(),
                active.lastPosition(),
                active.startedAt(),
                active.expiresAt());
    }

    private LocalDate toStudyDate(Instant timestamp) {
        return timestamp.atZone(studyZoneId).toLocalDate();
    }

    private Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(studyZoneId).toInstant();
    }

    private static boolean hasActivity(Map<LocalDate, Activity> activities, LocalDate date) {
        Activity activity = activities.get(date);
        return activity != null && activity.activityCount() > 0;
    }

    private static double percentage(long numerator, long denominator) {
        return denominator == 0 ? 0.0 : numerator * 100.0 / denominator;
    }

    private static final class Activity {
        private final Set<Long> conceptIds = new HashSet<>();
        private long questionsSolved;
        private long correctCount;
        private long wrongCount;

        private long activityCount() {
            return conceptIds.size() + questionsSolved;
        }
    }

    private static final class TopicActivity {
        private final long topicId;
        private final String topicContentKey;
        private final String topicTitle;
        private final String areaSlug;
        private final String areaName;
        private long attemptCount;
        private long correctCount;

        private TopicActivity(long topicId, String topicContentKey, String topicTitle, String areaSlug, String areaName) {
            this.topicId = topicId;
            this.topicContentKey = topicContentKey;
            this.topicTitle = topicTitle;
            this.areaSlug = areaSlug;
            this.areaName = areaName;
        }

        private DashboardWeakTopicView toView() {
            long wrongCount = attemptCount - correctCount;
            return new DashboardWeakTopicView(
                    topicId,
                    topicContentKey,
                    topicTitle,
                    areaSlug,
                    areaName,
                    attemptCount,
                    correctCount,
                    wrongCount,
                    percentage(correctCount, attemptCount));
        }
    }
}
