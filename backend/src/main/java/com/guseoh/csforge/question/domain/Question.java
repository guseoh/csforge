package com.guseoh.csforge.question.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import lombok.Getter;
import org.hibernate.annotations.BatchSize;

import com.guseoh.csforge.learning.domain.AuditedEntity;
import com.guseoh.csforge.learning.domain.Concept;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * 학습 문제의 본문, 유형, 정답 구성과 공개 상태 불변식을 관리하는 도메인 엔티티이다.
 */
@Getter
@Entity
@Table(name = "question")
public class Question extends AuditedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_key", nullable = false, length = 160, unique = true)
    private String contentKey;

    @Column(name = "prompt_markdown", nullable = false, columnDefinition = "TEXT")
    private String promptMarkdown;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 32)
    private QuestionType questionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private QuestionDifficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private QuestionStatus status;

    @Column(name = "explanation_markdown", columnDefinition = "TEXT")
    private String explanationMarkdown;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC, id ASC")
    @BatchSize(size = 100)
    private List<QuestionChoice> choices = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC, id ASC")
    @BatchSize(size = 100)
    private List<QuestionAnswer> answers = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 100)
    private List<QuestionConcept> conceptLinks = new ArrayList<>();

    protected Question() {
    }

    private Question(
            String contentKey,
            String promptMarkdown,
            QuestionType questionType,
            QuestionDifficulty difficulty,
            String explanationMarkdown) {
        this.contentKey = requireText(contentKey, "contentKey");
        this.promptMarkdown = requireText(promptMarkdown, "promptMarkdown");
        this.questionType = requireRequired(questionType, "questionType");
        this.difficulty = requireRequired(difficulty, "difficulty");
        this.status = QuestionStatus.DRAFT;
        this.explanationMarkdown = explanationMarkdown;
    }

    public static Question createDraft(
            String contentKey,
            String promptMarkdown,
            QuestionType questionType,
            QuestionDifficulty difficulty,
            String explanationMarkdown) {
        return new Question(contentKey, promptMarkdown, questionType, difficulty, explanationMarkdown);
    }

    public void reviseMetadata(String promptMarkdown, QuestionDifficulty difficulty, String explanationMarkdown) {
        this.promptMarkdown = requireText(promptMarkdown, "promptMarkdown");
        this.difficulty = requireRequired(difficulty, "difficulty");
        this.explanationMarkdown = explanationMarkdown;
    }

    public void replaceStructure(QuestionType questionType, List<ChoiceDraft> newChoices,
            String correctChoiceKey, List<String> acceptedAnswers, String modelAnswer, List<Concept> concepts) {
        this.questionType = requireRequired(questionType, "questionType");
        choices.clear();
        answers.clear();
        conceptLinks.clear();
        if (newChoices != null) {
            for (ChoiceDraft choice : newChoices) {
                addChoice(choice.choiceKey(), choice.contentMarkdown(), choice.displayOrder());
            }
        }
        if (correctChoiceKey != null) {
            QuestionChoice correctChoice = choices.stream()
                    .filter(choice -> choice.getChoiceKey().equals(correctChoiceKey))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("correctChoiceKey must match a choice"));
            defineCorrectChoice(correctChoice);
        }
        if (acceptedAnswers != null) acceptedAnswers.forEach(this::addAcceptedAnswer);
        if (modelAnswer != null) defineModelAnswer(modelAnswer);
        if (concepts != null) concepts.forEach(this::linkConcept);
    }

    public void changeToDraft() {
        this.status = QuestionStatus.DRAFT;
    }

    public void setCanonicalStatus(QuestionStatus status) {
        requireRequired(status, "status");
        if (status == QuestionStatus.PUBLISHED) publish();
        else if (status == QuestionStatus.ARCHIVED) archive();
        else changeToDraft();
    }

    public record ChoiceDraft(String choiceKey, String contentMarkdown, int displayOrder) { }

    public QuestionChoice addChoice(String choiceKey, String contentMarkdown, int displayOrder) {
        requireText(choiceKey, "choiceKey");
        if (choices.stream().anyMatch(choice -> choice.getChoiceKey().equals(choiceKey))) {
            throw new IllegalArgumentException("choiceKey must be unique within a question");
        }
        if (displayOrder < 0) {
            throw new IllegalArgumentException("displayOrder must be non-negative");
        }
        if (choices.stream().anyMatch(choice -> choice.getDisplayOrder() == displayOrder)) {
            throw new IllegalArgumentException("displayOrder must be unique within a question");
        }
        QuestionChoice choice = new QuestionChoice(
                this,
                choiceKey,
                requireText(contentMarkdown, "contentMarkdown"),
                displayOrder);
        choices.add(choice);
        return choice;
    }

    public void defineCorrectChoice(QuestionChoice choice) {
        requireOwnedChoice(choice);
        answers.removeIf(answer -> answer.getAnswerKind() == QuestionAnswerKind.CORRECT_CHOICE);
        answers.add(QuestionAnswer.correctChoice(this, choice));
    }

    public void addAcceptedAnswer(String answerText) {
        String normalized = requireText(answerText, "answerText").trim();
        if (answers.stream().anyMatch(answer -> answer.getAnswerKind() == QuestionAnswerKind.ACCEPTED_TEXT
                && answer.getAnswerText().trim().equalsIgnoreCase(normalized))) {
            throw new IllegalArgumentException("accepted answer must be unique within a question");
        }
        int displayOrder = (int) answers.stream()
                .filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.ACCEPTED_TEXT)
                .count();
        answers.add(QuestionAnswer.acceptedText(this, normalized, displayOrder));
    }

    public void defineModelAnswer(String answerText) {
        String normalized = requireText(answerText, "answerText").trim();
        answers.removeIf(answer -> answer.getAnswerKind() == QuestionAnswerKind.MODEL_ANSWER);
        answers.add(QuestionAnswer.modelAnswer(this, normalized));
    }

    public void linkConcept(Concept concept) {
        if (concept == null) {
            throw new IllegalArgumentException("concept is required");
        }
        boolean alreadyLinked = conceptLinks.stream().anyMatch(link -> sameConcept(link.getConcept(), concept));
        if (!alreadyLinked) {
            conceptLinks.add(new QuestionConcept(this, concept));
        }
    }

    public void publish() {
        validatePublicationRequirements();
        this.status = QuestionStatus.PUBLISHED;
    }

    public void archive() {
        this.status = QuestionStatus.ARCHIVED;
    }

    @PrePersist
    @PreUpdate
    private void validatePersistedState() {
        if (status == QuestionStatus.PUBLISHED) {
            validatePublicationRequirements();
        }
    }

    private void validatePublicationRequirements() {
        if (conceptLinks.isEmpty()) {
            throw new IllegalStateException("A published question must be linked to at least one concept");
        }
        switch (questionType) {
            case MULTIPLE_CHOICE -> {
                if (choices.size() < 2 || answers.stream().filter(this::isCorrectChoice).count() != 1) {
                    throw new IllegalStateException(
                            "A published multiple-choice question needs at least two choices and one correct choice");
                }
            }
            case SHORT_ANSWER -> {
                if (answers.stream().noneMatch(answer -> answer.getAnswerKind() == QuestionAnswerKind.ACCEPTED_TEXT)) {
                    throw new IllegalStateException("A published short-answer question needs an accepted answer");
                }
            }
            case DESCRIPTIVE, SCENARIO -> {
                if (answers.stream().filter(answer -> answer.getAnswerKind() == QuestionAnswerKind.MODEL_ANSWER).count() != 1) {
                    throw new IllegalStateException("A published self-check question needs one model answer");
                }
            }
        }
    }

    private boolean isCorrectChoice(QuestionAnswer answer) {
        return answer.getAnswerKind() == QuestionAnswerKind.CORRECT_CHOICE && answer.getChoice() != null;
    }

    private void requireOwnedChoice(QuestionChoice choice) {
        if (choice == null || choice.getQuestion() != this || !choices.contains(choice)) {
            throw new IllegalArgumentException("choice must belong to this question");
        }
    }

    private static boolean sameConcept(Concept left, Concept right) {
        if (left == right) {
            return true;
        }
        if (left.getId() == null || right.getId() == null) {
            return false;
        }
        return left.getId().equals(right.getId());
    }

    private static String requireText(String value, String name) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(name + " is required");
        }
        return value;
    }

    private static <T> T requireRequired(T value, String name) {
        if (value == null) {
            throw new IllegalArgumentException(name + " is required");
        }
        return value;
    }

    public List<QuestionChoice> getChoices() {
        return Collections.unmodifiableList(choices);
    }

    public List<QuestionAnswer> getAnswers() {
        return Collections.unmodifiableList(answers);
    }

    public List<QuestionConcept> getConceptLinks() {
        return Collections.unmodifiableList(conceptLinks);
    }
}
