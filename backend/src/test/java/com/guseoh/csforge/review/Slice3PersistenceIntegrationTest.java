package com.guseoh.csforge.review;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.guseoh.csforge.quiz.application.QuizQuestionSelectionCriteria;
import com.guseoh.csforge.quiz.application.QuizQuestionState;
import com.guseoh.csforge.review.application.ReviewDueWindow;
import com.guseoh.csforge.review.application.ReviewListCriteria;
import com.guseoh.csforge.review.application.ReviewTimeWindow;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleStatus;
import com.guseoh.csforge.quiz.infrastructure.QuestionSelectionRepository;
import com.guseoh.csforge.review.infrastructure.ReviewScheduleSearchRepository;

/**
 * Slice 3의 V4 스키마와 오답·복습 문제 선택 계약을 PostgreSQL에서 검증한다.
 */
@Testcontainers
@SpringBootTest
class Slice3PersistenceIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_slice3_test")
            .withUsername("csforge")
            .withPassword("csforge");

    @DynamicPropertySource
    static void registerDatabaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    QuestionSelectionRepository selectionRepository;

    @Autowired
    ReviewScheduleSearchRepository reviewSearchRepository;

    private long conceptId;
    private long questionId;

    @BeforeEach
    void setUp() {
        jdbc.update("DELETE FROM review_history");
        jdbc.update("DELETE FROM review_schedule");
        jdbc.update("DELETE FROM wrong_note");
        jdbc.update("DELETE FROM attempt");
        jdbc.update("DELETE FROM quiz_question");
        jdbc.update("DELETE FROM quiz_session");
        jdbc.update("DELETE FROM question_concept");
        jdbc.update("DELETE FROM question_answer");
        jdbc.update("DELETE FROM question_choice");
        jdbc.update("DELETE FROM question");
        jdbc.update("DELETE FROM personal_note");
        jdbc.update("DELETE FROM concept_reference");
        jdbc.update("DELETE FROM concept_progress");
        jdbc.update("DELETE FROM concept");
        jdbc.update("DELETE FROM topic");

        long areaId = jdbc.queryForObject(
                "SELECT id FROM learning_area WHERE slug = 'java'",
                Long.class);
        long topicId = jdbc.queryForObject(
                "INSERT INTO topic (learning_area_id, content_key, slug, title, display_order) VALUES (?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                areaId,
                "slice3-regression-topic",
                "slice3-regression-topic",
                "Slice 3 regression topic",
                1);
        conceptId = jdbc.queryForObject(
                "INSERT INTO concept (topic_id, content_key, slug, title, content_markdown, level, status, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                topicId,
                "slice3-regression-concept",
                "slice3-regression-concept",
                "Slice 3 regression concept",
                "# Slice 3",
                1,
                "PUBLISHED",
                1);
        questionId = jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status) VALUES (?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                "slice3-regression-question",
                "Slice 3 regression question",
                "SHORT_ANSWER",
                "EASY",
                "PUBLISHED");
        jdbc.update(
                "INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)",
                questionId,
                conceptId);
    }

    @Test
    void v4SchemaProtectsKnownAccessPathsAndReviewScheduleInvariant() {
        assertIndexExists("attempt_question_updated_idx");
        assertIndexExists("wrong_note_status_recent_idx");
        assertIndexExists("wrong_note_count_idx");
        assertIndexExists("review_schedule_status_due_idx");
        assertIndexExists("review_history_question_recent_idx");

        jdbc.update(
                "INSERT INTO review_schedule (question_id, status, stage, due_at) VALUES (?, 'SCHEDULED', 1, ?)",
                questionId,
                Timestamp.from(Instant.parse("2026-08-31T00:00:00Z")));

        assertThrows(
                DataIntegrityViolationException.class,
                () -> jdbc.update("UPDATE review_schedule SET due_at = NULL WHERE question_id = ?", questionId));
    }

    @Test
    void wrongAndReviewNeededQuestionStatesAreBackedByCurrentAggregates() {
        QuizQuestionSelectionCriteria wrong = criteria(QuizQuestionState.WRONG);
        QuizQuestionSelectionCriteria reviewNeeded = criteria(QuizQuestionState.REVIEW_NEEDED);

        assertEquals(0, selectionRepository.count(wrong));
        assertEquals(0, selectionRepository.count(reviewNeeded));

        Instant now = Instant.parse("2026-08-30T00:00:00Z");
        jdbc.update(
                "INSERT INTO wrong_note (question_id, status, wrong_count, first_wrong_at, last_wrong_at) VALUES (?, 'ACTIVE', 1, ?, ?)",
                questionId,
                Timestamp.from(now),
                Timestamp.from(now));
        assertEquals(1, selectionRepository.count(wrong));

        jdbc.update(
                "INSERT INTO review_schedule (question_id, status, stage, due_at) VALUES (?, 'SCHEDULED', 1, ?)",
                questionId,
                Timestamp.from(now.plusSeconds(86_400)));
        assertEquals(1, selectionRepository.count(reviewNeeded));

        jdbc.update("UPDATE wrong_note SET status = 'MASTERED' WHERE question_id = ?", questionId);
        jdbc.update("UPDATE review_schedule SET status = 'MASTERED', due_at = NULL WHERE question_id = ?", questionId);
        assertEquals(0, selectionRepository.count(wrong));
        assertEquals(0, selectionRepository.count(reviewNeeded));
    }

    @Test
    void reviewFiltersUseCalendarBoundaryAndNonOverlappingFutureWindows() {
        ZoneId zone = ZoneId.of("Asia/Seoul");
        Clock clock = Clock.fixed(Instant.parse("2026-09-04T03:00:00Z"), zone);
        ReviewTimeWindow window = ReviewTimeWindow.from(Instant.now(clock), zone);
        long dueNowId = insertQuestion("slice3-due-now-question");
        long next24Id = insertQuestion("slice3-next-24-question");
        long next7Id = insertQuestion("slice3-next-7-question");
        long laterId = insertQuestion("slice3-later-question");
        long exactNext24Id = insertQuestion("slice3-exact-next-24-question");
        attachToConcept(dueNowId);
        attachToConcept(next24Id);
        attachToConcept(next7Id);
        attachToConcept(laterId);
        attachToConcept(exactNext24Id);
        schedule(questionId, Instant.parse("2026-09-03T14:59:59Z"));
        schedule(dueNowId, Instant.parse("2026-09-04T02:00:00Z"));
        schedule(next24Id, Instant.parse("2026-09-04T04:00:00Z"));
        schedule(exactNext24Id, window.next24Hours());
        schedule(next7Id, Instant.parse("2026-09-06T03:00:01Z"));
        schedule(laterId, Instant.parse("2026-09-12T03:00:01Z"));

        assertQuestionIds(ReviewDueWindow.OVERDUE, window, questionId);
        assertQuestionIds(ReviewDueWindow.DUE, window, questionId, dueNowId);
        assertQuestionIds(ReviewDueWindow.NEXT_24H, window, next24Id, exactNext24Id);
        assertQuestionIds(ReviewDueWindow.NEXT_7D, window, next7Id);
        assertQuestionIds(ReviewDueWindow.ALL, window, questionId, dueNowId, next24Id, exactNext24Id, next7Id, laterId);
    }

    private void assertQuestionIds(ReviewDueWindow dueWindow, ReviewTimeWindow window, long... expectedIds) {
        ReviewListCriteria criteria = new ReviewListCriteria(
                dueWindow, ReviewScheduleStatus.SCHEDULED, null, null, null).at(window);
        List<Long> actualIds = reviewSearchRepository.search(criteria, PageRequest.of(0, 20)).getContent().stream()
                .map(ReviewSchedule::getQuestionId)
                .toList();
        assertEquals(Arrays.stream(expectedIds).boxed().toList(), actualIds);
    }

    private long insertQuestion(String contentKey) {
        return jdbc.queryForObject(
                "INSERT INTO question (content_key, prompt_markdown, question_type, difficulty, status) VALUES (?, ?, ?, ?, ?) RETURNING id",
                Long.class,
                contentKey,
                contentKey,
                "SHORT_ANSWER",
                "EASY",
                "PUBLISHED");
    }

    private void attachToConcept(long id) {
        jdbc.update("INSERT INTO question_concept (question_id, concept_id) VALUES (?, ?)", id, conceptId);
    }

    private void schedule(long id, Instant dueAt) {
        jdbc.update(
                "INSERT INTO review_schedule (question_id, status, stage, due_at) VALUES (?, 'SCHEDULED', 1, ?)",
                id,
                Timestamp.from(dueAt));
    }

    private QuizQuestionSelectionCriteria criteria(QuizQuestionState state) {
        return new QuizQuestionSelectionCriteria(
                List.of("java"),
                List.of(conceptId),
                List.of(),
                List.of(),
                List.of(),
                state);
    }

    private void assertIndexExists(String indexName) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = current_schema() AND indexname = ?",
                Integer.class,
                indexName);
        assertTrue(count != null && count > 0, () -> "Missing index: " + indexName);
    }
}
