package com.guseoh.csforge.wrongnote.application;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.guseoh.csforge.question.domain.QuestionAnswer;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionConcept;
import com.guseoh.csforge.question.domain.QuestionAnswerRepository;
import com.guseoh.csforge.question.domain.QuestionConceptRepository;
import com.guseoh.csforge.quiz.domain.Attempt;
import com.guseoh.csforge.quiz.domain.AttemptRepository;
import com.guseoh.csforge.review.domain.ReviewSchedule;
import com.guseoh.csforge.review.domain.ReviewScheduleRepository;
import com.guseoh.csforge.wrongnote.domain.WrongNote;
import com.guseoh.csforge.wrongnote.domain.WrongNoteRepository;
import com.guseoh.csforge.wrongnote.infrastructure.WrongNoteSearchRepository;

/**
 * 오답 노트 목록·상세·bounded history 조회를 처리한다.
 */
@Service
@RequiredArgsConstructor
public class WrongNoteQueryService {

    private final WrongNoteSearchRepository searchRepository;
    private final WrongNoteRepository wrongNoteRepository;
    private final ReviewScheduleRepository scheduleRepository;
    private final QuestionConceptRepository conceptRepository;
    private final QuestionAnswerRepository answerRepository;
    private final AttemptRepository attemptRepository;
    private final Clock clock;

    @Transactional(readOnly = true)
    public WrongNotePageView list(WrongNoteListCriteria criteria, int page, int size) {
        Page<WrongNote> result = searchRepository.search(criteria, PageRequest.of(page, size));
        List<Long> questionIds = result.getContent().stream().map(note -> note.getQuestion().getId()).toList();
        Map<Long, List<QuestionConcept>> concepts = groupedConcepts(questionIds);
        Map<Long, ReviewSchedule> schedules = scheduleRepository.findByQuestionIdIn(questionIds).stream()
                .collect(Collectors.toMap(ReviewSchedule::getQuestionId, item -> item));
        List<WrongNoteListItemView> items = result.getContent().stream()
                .map(note -> toListItem(note, concepts.getOrDefault(note.getQuestion().getId(), List.of()), schedules.get(note.getQuestion().getId())))
                .toList();
        return new WrongNotePageView(items, result.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public WrongNoteDetailView detail(long questionId) {
        WrongNote note = wrongNoteRepository.findByQuestionId(questionId)
                .orElseThrow(() -> new WrongNoteNotFoundException());
        List<QuestionConcept> concepts = conceptRepository.findForQuestionIds(List.of(questionId));
        List<QuestionAnswer> answers = answerRepository.findForQuestionIds(List.of(questionId));
        ReviewSchedule schedule = scheduleRepository.findByQuestionId(questionId).orElse(null);
        return new WrongNoteDetailView(
                new WrongNoteQuestionView(questionId, note.getQuestion().getPromptMarkdown(), note.getQuestion().getQuestionType(), note.getQuestion().getDifficulty(), note.getQuestion().getExplanationMarkdown()),
                concepts.stream().map(this::toConcept).toList(),
                toLatestAttempt(note.getLastWrongAttempt()),
                toAnswer(answers),
                toState(note, schedule));
    }

    @Transactional(readOnly = true)
    public WrongNoteAttemptPageView attempts(long questionId, String cursor, int size) {
        if (!wrongNoteRepository.findByQuestionId(questionId).isPresent()) throw new WrongNoteNotFoundException();
        Cursor decoded = Cursor.decode(cursor);
        List<Attempt> attempts = decoded.at() == null
                ? attemptRepository.findQuestionHistoryFirst(questionId, PageRequest.of(0, size + 1))
                : attemptRepository.findQuestionHistoryAfter(questionId, decoded.at(), decoded.id(), PageRequest.of(0, size + 1));
        boolean hasNext = attempts.size() > size;
        List<Attempt> page = hasNext ? attempts.subList(0, size) : attempts;
        String next = hasNext ? Cursor.encode(page.get(page.size() - 1)) : null;
        return new WrongNoteAttemptPageView(page.stream().map(this::toAttempt).toList(), next);
    }

    private WrongNoteListItemView toListItem(WrongNote note, List<QuestionConcept> links, ReviewSchedule schedule) {
        return new WrongNoteListItemView(
                note.getQuestion().getId(), note.getQuestion().getPromptMarkdown(), note.getQuestion().getQuestionType(), note.getQuestion().getDifficulty(),
                links.stream().map(this::toConcept).toList(), note.getWrongCount(), note.getLastWrongAt(), note.getStatus().name(),
                schedule == null ? null : schedule.getStatus(), schedule == null ? null : schedule.getStage(), schedule == null ? null : schedule.getDueAt());
    }

    private WrongNoteStateView toState(WrongNote note, ReviewSchedule schedule) {
        return new WrongNoteStateView(note.getStatus(), note.getWrongCount(), note.getFirstWrongAt(), note.getLastWrongAt(), note.getCauseNote(),
                schedule == null ? null : schedule.getStatus(), schedule == null ? null : schedule.getStage(), schedule == null ? null : schedule.getDueAt());
    }

    private WrongNoteLatestAttemptView toLatestAttempt(Attempt attempt) {
        return new WrongNoteLatestAttemptView(attempt.getId(), attempt.getQuizSession().getId(), attempt.getQuizSession().getSource().name(),
                attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey(), attempt.getAnswerText(), attempt.getGradingStatus(), attempt.getCorrect(),
                attempt.isReviewNeeded(), attempt.getAnsweredAt(), attempt.getGradedAt());
    }

    private WrongNoteAttemptView toAttempt(Attempt attempt) {
        return new WrongNoteAttemptView(attempt.getId(), attempt.getQuizSession().getId(), attempt.getQuizSession().getSource().name(),
                attempt.getSelectedChoice() == null ? null : attempt.getSelectedChoice().getChoiceKey(), attempt.getAnswerText(), attempt.getGradingStatus(), attempt.getCorrect(),
                attempt.isReviewNeeded(), attempt.getAnsweredAt(), attempt.getGradedAt(), attempt.getUpdatedAt());
    }

    private WrongNoteAnswerView toAnswer(List<QuestionAnswer> answers) {
        String choice = answers.stream().filter(item -> item.getAnswerKind() == QuestionAnswerKind.CORRECT_CHOICE)
                .map(QuestionAnswer::getChoice).filter(java.util.Objects::nonNull).map(item -> item.getChoiceKey()).findFirst().orElse(null);
        List<String> accepted = answers.stream().filter(item -> item.getAnswerKind() == QuestionAnswerKind.ACCEPTED_TEXT).map(QuestionAnswer::getAnswerText).toList();
        String model = answers.stream().filter(item -> item.getAnswerKind() == QuestionAnswerKind.MODEL_ANSWER).map(QuestionAnswer::getAnswerText).findFirst().orElse(null);
        return new WrongNoteAnswerView(choice, accepted, model);
    }

    private Map<Long, List<QuestionConcept>> groupedConcepts(List<Long> ids) {
        return conceptRepository.findForQuestionIds(ids).stream().collect(Collectors.groupingBy(item -> item.getQuestion().getId(), LinkedHashMap::new, Collectors.toList()));
    }

    private WrongNoteListItemView.ConceptView toConcept(QuestionConcept link) {
        var concept = link.getConcept();
        var topic = concept.getTopic();
        var area = topic.getLearningArea();
        return new WrongNoteListItemView.ConceptView(concept.getId(), concept.getSlug(), concept.getTitle(), area.getSlug(), area.getName(), concept.getLevel());
    }

    private record Cursor(Instant at, long id) {
        static Cursor decode(String value) {
            if (value == null || value.isBlank()) return new Cursor(null, 0);
            try {
                String decoded = new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
                String[] parts = decoded.split(",", 2);
                return new Cursor(Instant.parse(parts[0]), Long.parseLong(parts[1]));
            } catch (RuntimeException exception) {
                throw new IllegalArgumentException("Invalid cursor");
            }
        }

        static String encode(Attempt attempt) {
            return Base64.getUrlEncoder().withoutPadding().encodeToString((attempt.getUpdatedAt() + "," + attempt.getId()).getBytes(StandardCharsets.UTF_8));
        }
    }
}
