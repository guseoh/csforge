package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.ConceptReferenceId;
import com.guseoh.csforge.learning.domain.ConceptReferenceRepository;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.ReferenceRepository;
import com.guseoh.csforge.learning.domain.ReferenceType;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.learning.domain.TopicRepository;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionChoice;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.question.domain.QuestionStatus;
import com.guseoh.csforge.question.domain.QuestionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** matching preview를 검증한 뒤 canonical aggregate를 한 transaction에서 upsert한다. */
@Service
@RequiredArgsConstructor
public class ContentImportApplyService {
    private final ContentImportAnalyzer analyzer;
    private final TopicRepository topicRepository;
    private final ConceptRepository conceptRepository;
    private final ReferenceRepository referenceRepository;
    private final QuestionRepository questionRepository;
    private final QuestionChoiceRepository questionChoiceRepository;
    private final ConceptReferenceRepository conceptReferenceRepository;

    @Transactional
    public ImportApplyResult apply(ImportFilesCommand command, String previewDigest) {
        ImportAnalysis analysis = analyzer.analyze(command);
        if (!analysis.digest().equals(previewDigest)) throw new ImportPreviewStaleException();
        if (analysis.hasErrors()) throw new IllegalArgumentException("Import preview contains validation errors");
        Map<String, Topic> topics = new HashMap<>(analysis.state().topics());
        Map<String, Concept> concepts = new HashMap<>(analysis.state().concepts());
        Map<String, Reference> references = new HashMap<>(analysis.state().references());
        Map<String, Question> questions = new HashMap<>(analysis.state().questions());
        Map<ConceptReferenceId, ConceptReference> relationLinks = new HashMap<>();
        List<DeferredCorrectChoice> deferredCorrectChoices = new ArrayList<>();
        analysis.state().conceptReferences().values().stream()
                .flatMap(List::stream)
                .forEach(link -> relationLinks.put(link.getId(), link));
        for (NormalizedImportItem item : analysis.items()) {
            if (item.kind() == ImportItemKind.TOPIC && shouldApply(item, analysis)) {
                upsertTopic(item, analysis.state(), topics);
            }
        }
        for (NormalizedImportItem item : analysis.items()) {
            if (item.kind() == ImportItemKind.CONCEPT && shouldApply(item, analysis)) {
                upsertConcept(item, topics, concepts, references, relationLinks);
            }
        }
        for (NormalizedImportItem item : analysis.items()) {
            if (item.kind() == ImportItemKind.QUESTION && shouldApply(item, analysis)) {
                upsertQuestion(item, concepts, questions, deferredCorrectChoices);
            }
        }
        completeDeferredCorrectChoices(deferredCorrectChoices);
        return new ImportApplyResult(
                analysis.digest(),
                count(analysis, ImportClassification.CREATED),
                count(analysis, ImportClassification.UPDATED),
                count(analysis, ImportClassification.UNCHANGED),
                count(analysis, ImportClassification.SKIPPED),
                0,
                analysis.previews());
    }

    private void upsertTopic(NormalizedImportItem item, ImportState state, Map<String, Topic> topics) {
        Topic topic = topics.get(item.contentKey());
        LearningArea area = state.areas().get(item.areaSlug());
        if (area == null) {
            throw new IllegalArgumentException("Unknown LearningArea: " + item.areaSlug());
        }
        if (topic == null) {
            topic = Topic.create(area, item.contentKey(), item.slug(), item.title(), item.description(), item.displayOrder(), item.active());
        } else {
            topic.reviseCanonicalContent(area, item.slug(), item.title(), item.description(), item.displayOrder(), item.active());
        }
        Topic saved = topicRepository.save(topic);
        topics.put(item.contentKey(), saved);
    }

    private void upsertConcept(NormalizedImportItem item, Map<String, Topic> topics, Map<String, Concept> concepts,
            Map<String, Reference> references, Map<ConceptReferenceId, ConceptReference> relationLinks) {
        Topic topic = topics.get(item.topicContentKey());
        Concept concept = concepts.get(item.contentKey());
        if (concept == null) {
            concept = Concept.create(topic, item.contentKey(), item.slug(), item.title(), item.summary(), item.contentMarkdown(), item.level(), ContentStatus.valueOf(item.status()), item.displayOrder());
        } else {
            concept.reviseCanonicalContent(topic, item.slug(), item.title(), item.summary(), item.contentMarkdown(), item.level(), ContentStatus.valueOf(item.status()), item.displayOrder());
        }
        concept = conceptRepository.save(concept);
        concepts.put(item.contentKey(), concept);
        if (item.referencesDeclared()) replaceReferences(concept, item, references, relationLinks);
    }

    private void replaceReferences(Concept concept, NormalizedImportItem item, Map<String, Reference> references,
            Map<ConceptReferenceId, ConceptReference> relationLinks) {
        List<ConceptReference> existing = relationLinks.values().stream()
                .filter(link -> link.getConcept().getId().equals(concept.getId()))
                .toList();
        Set<String> incoming = item.references().stream()
                .map(NormalizedReference::url)
                .collect(Collectors.toSet());
        existing.stream().filter(link -> !incoming.contains(link.getReference().getUrl())).forEach(link -> {
            conceptReferenceRepository.delete(link);
            relationLinks.remove(link.getId());
        });
        for (NormalizedReference input : item.references()) {
            Reference reference = references.get(input.url());
            if (reference == null) {
                reference = Reference.create(input.url(), input.title(), ReferenceType.valueOf(input.referenceType()), input.language(), input.depth(), input.recommendation());
            } else {
                reference.reviseCanonicalMetadata(input.url(), input.title(), ReferenceType.valueOf(input.referenceType()), input.language(), input.depth(), input.recommendation());
            }
            reference = referenceRepository.save(reference);
            references.put(input.url(), reference);
            ConceptReferenceId id = new ConceptReferenceId(concept.getId(), reference.getId());
            ConceptReference link = relationLinks.get(id);
            if (link == null) {
                link = ConceptReference.link(concept, reference, input.displayOrder(), input.relationNote());
            }
            link.reviseRelation(input.displayOrder(), input.relationNote());
            link = conceptReferenceRepository.save(link);
            relationLinks.put(id, link);
        }
    }

    private void upsertQuestion(
            NormalizedImportItem item,
            Map<String, Concept> concepts,
            Map<String, Question> questions,
            List<DeferredCorrectChoice> deferredCorrectChoices) {
        Question question = questions.get(item.contentKey());
        List<Concept> linkedConcepts = item.conceptKeys().stream().map(concepts::get).toList();
        List<Question.ChoiceDraft> choices = item.choices().stream().map(choice -> new Question.ChoiceDraft(
                choice.key(), choice.content(), choice.rationaleMarkdown(), choice.displayOrder())).toList();
        boolean newQuestion = question == null;
        QuestionStatus targetStatus = QuestionStatus.valueOf(item.status());
        if (newQuestion) {
            question = Question.createDraft(item.contentKey(), item.promptMarkdown(), QuestionType.valueOf(item.questionType()), QuestionDifficulty.valueOf(item.difficulty()), item.explanationMarkdown());
        } else {
            if (targetStatus != QuestionStatus.PUBLISHED) {
                question.changeToDraft();
            }
            question.reviseMetadata(item.promptMarkdown(), QuestionDifficulty.valueOf(item.difficulty()), item.explanationMarkdown());
        }
        boolean deferCorrectChoice = false;
        if (newQuestion || !QuestionStructureComparator.matches(item, question)) {
            if (!newQuestion) {
                question.changeToDraft();
            }
            prepareChoiceOrderUpdate(question, choices);
            deferCorrectChoice = correctChoiceNeedsPersistedChoice(question, item);
            question.replaceStructure(
                    QuestionType.valueOf(item.questionType()),
                    choices,
                    deferCorrectChoice ? null : item.correctChoiceKey(),
                    item.acceptedAnswers(),
                    item.modelAnswer(),
                    linkedConcepts);
        }
        if (deferCorrectChoice) {
            Question saved = questionRepository.save(question);
            questions.put(item.contentKey(), saved);
            deferredCorrectChoices.add(new DeferredCorrectChoice(saved, item.correctChoiceKey(), targetStatus));
            return;
        }
        question.setCanonicalStatus(targetStatus);
        Question saved = questionRepository.save(question);
        questions.put(item.contentKey(), saved);
    }

    private void completeDeferredCorrectChoices(List<DeferredCorrectChoice> deferredCorrectChoices) {
        if (deferredCorrectChoices.isEmpty()) {
            return;
        }
        questionRepository.flush();
        for (DeferredCorrectChoice deferred : deferredCorrectChoices) {
            QuestionChoice correctChoice = deferred.question().getChoices().stream()
                    .filter(choice -> choice.getChoiceKey().equals(deferred.choiceKey()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("correctChoiceKey must match a persisted choice"));
            deferred.question().defineCorrectChoice(correctChoice);
            deferred.question().setCanonicalStatus(deferred.targetStatus());
            questionRepository.save(deferred.question());
        }
    }

    private static boolean correctChoiceNeedsPersistedChoice(Question question, NormalizedImportItem item) {
        if (!QuestionType.MULTIPLE_CHOICE.name().equals(item.questionType()) || item.correctChoiceKey() == null) {
            return false;
        }
        return question.getChoices().stream()
                .noneMatch(choice -> choice.getChoiceKey().equals(item.correctChoiceKey()));
    }

    private void prepareChoiceOrderUpdate(Question question, List<Question.ChoiceDraft> incomingChoices) {
        if (!choiceOrdersMayConflict(question, incomingChoices)) {
            return;
        }
        int maxIncomingOrder = incomingChoices.stream().mapToInt(Question.ChoiceDraft::displayOrder).max().orElse(0);
        int maxExistingOrder = question.getChoices().stream().mapToInt(choice -> choice.getDisplayOrder()).max().orElse(0);
        long offset = (long) maxIncomingOrder + 1L;
        if (offset > Integer.MAX_VALUE - (long) maxExistingOrder) {
            throw new IllegalArgumentException("choice displayOrder values leave no safe temporary range");
        }
        questionChoiceRepository.shiftDisplayOrders(question.getId(), (int) offset);
    }

    private static boolean choiceOrdersMayConflict(Question question, List<Question.ChoiceDraft> incomingChoices) {
        if (question.getChoices().isEmpty() || incomingChoices.isEmpty()) {
            return false;
        }
        Map<String, Integer> existingOrders = question.getChoices().stream()
                .collect(Collectors.toMap(choice -> choice.getChoiceKey(), choice -> choice.getDisplayOrder()));
        if (existingOrders.size() != incomingChoices.size()) return true;
        return incomingChoices.stream().anyMatch(choice -> !Objects.equals(existingOrders.get(choice.choiceKey()), choice.displayOrder()));
    }

    private static int count(ImportAnalysis analysis, ImportClassification classification) {
        return Math.toIntExact(analysis.count(classification));
    }

    private static boolean shouldApply(NormalizedImportItem item, ImportAnalysis analysis) {
        return analysis.previews().stream().filter(preview -> preview.fileName().equals(item.fileName()) && preview.itemIndex() == item.itemIndex())
                .map(ImportItemPreview::classification).anyMatch(c -> c == ImportClassification.CREATED || c == ImportClassification.UPDATED);
    }

    private record DeferredCorrectChoice(Question question, String choiceKey, QuestionStatus targetStatus) {
    }
}
