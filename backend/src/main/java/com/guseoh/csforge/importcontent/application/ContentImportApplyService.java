package com.guseoh.csforge.importcontent.application;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.ConceptReferenceId;
import com.guseoh.csforge.learning.domain.ConceptRepository;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.LearningArea;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.ReferenceRepository;
import com.guseoh.csforge.learning.domain.ReferenceType;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.learning.domain.TopicRepository;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionChoiceRepository;
import com.guseoh.csforge.question.domain.QuestionDifficulty;
import com.guseoh.csforge.question.domain.QuestionRepository;
import com.guseoh.csforge.question.domain.QuestionStatus;
import com.guseoh.csforge.question.domain.QuestionType;
import com.guseoh.csforge.search.application.SearchChangeType;
import com.guseoh.csforge.search.application.SearchProjectionChangeRecorder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** matching preview를 검증한 뒤 canonical aggregate와 Search outbox를 한 transaction에서 upsert한다. */
@Service
@RequiredArgsConstructor
public class ContentImportApplyService {
    private final ContentImportAnalyzer analyzer;
    private final TopicRepository topicRepository;
    private final ConceptRepository conceptRepository;
    private final ReferenceRepository referenceRepository;
    private final QuestionRepository questionRepository;
    private final QuestionChoiceRepository questionChoiceRepository;
    private final com.guseoh.csforge.learning.domain.ConceptReferenceRepository conceptReferenceRepository;
    private final SearchProjectionChangeRecorder searchChangeRecorder;

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
        analysis.state().conceptReferences().values().stream().flatMap(List::stream)
                .forEach(link -> relationLinks.put(link.getId(), link));
        for (NormalizedImportItem item : analysis.items()) if (item.kind() == ImportItemKind.TOPIC && shouldApply(item, analysis)) upsertTopic(item, analysis.state(), topics);
        for (NormalizedImportItem item : analysis.items()) if (item.kind() == ImportItemKind.CONCEPT && shouldApply(item, analysis)) upsertConcept(item, topics, concepts, references, relationLinks);
        for (NormalizedImportItem item : analysis.items()) if (item.kind() == ImportItemKind.QUESTION && shouldApply(item, analysis)) upsertQuestion(item, concepts, questions);
        return new ImportApplyResult(analysis.digest(), count(analysis, ImportClassification.CREATED), count(analysis, ImportClassification.UPDATED), count(analysis, ImportClassification.UNCHANGED), count(analysis, ImportClassification.SKIPPED), 0, analysis.previews());
    }

    private void upsertTopic(NormalizedImportItem item, ImportState state, Map<String, Topic> topics) {
        Topic topic = topics.get(item.contentKey());
        LearningArea area = state.areas().entrySet().stream()
                .filter(entry -> java.util.Objects.equals(entry.getKey(), item.areaSlug()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown LearningArea: " + item.areaSlug()));
        if (topic == null) topic = Topic.create(area, item.contentKey(), item.slug(), item.title(), item.description(), item.displayOrder(), item.active());
        else topic.reviseCanonicalContent(area, item.slug(), item.title(), item.description(), item.displayOrder(), item.active());
        Topic saved = topicRepository.save(topic);
        topics.put(item.contentKey(), saved);
        searchChangeRecorder.record(SearchChangeType.TOPIC, saved.getId());
    }

    private void upsertConcept(NormalizedImportItem item, Map<String, Topic> topics, Map<String, Concept> concepts,
            Map<String, Reference> references, Map<ConceptReferenceId, ConceptReference> relationLinks) {
        Topic topic = topics.get(item.topicContentKey());
        Concept concept = concepts.get(item.contentKey());
        if (concept == null) concept = Concept.create(topic, item.contentKey(), item.slug(), item.title(), item.summary(), item.contentMarkdown(), item.level(), ContentStatus.valueOf(item.status()), item.displayOrder());
        else concept.reviseCanonicalContent(topic, item.slug(), item.title(), item.summary(), item.contentMarkdown(), item.level(), ContentStatus.valueOf(item.status()), item.displayOrder());
        concept = conceptRepository.save(concept);
        concepts.put(item.contentKey(), concept);
        if (item.referencesDeclared()) replaceReferences(concept, item, references, relationLinks);
        searchChangeRecorder.record(SearchChangeType.CONCEPT, concept.getId());
    }

    private void replaceReferences(Concept concept, NormalizedImportItem item, Map<String, Reference> references,
            Map<ConceptReferenceId, ConceptReference> relationLinks) {
        List<ConceptReference> existing = relationLinks.values().stream()
                .filter(link -> link.getConcept().getId().equals(concept.getId()))
                .toList();
        java.util.Set<String> incoming = item.references().stream().map(NormalizedReference::url).collect(java.util.stream.Collectors.toSet());
        existing.stream().filter(link -> !incoming.contains(link.getReference().getUrl())).forEach(link -> {
            long removedReferenceId = link.getReference().getId();
            conceptReferenceRepository.delete(link);
            relationLinks.remove(link.getId());
            searchChangeRecorder.record(SearchChangeType.REFERENCE, removedReferenceId);
        });
        for (NormalizedReference input : item.references()) {
            Reference reference = references.get(input.url());
            if (reference == null) reference = Reference.create(input.url(), input.title(), ReferenceType.valueOf(input.referenceType()), input.language(), input.depth(), input.recommendation());
            else reference.reviseCanonicalMetadata(input.url(), input.title(), ReferenceType.valueOf(input.referenceType()), input.language(), input.depth(), input.recommendation());
            reference = referenceRepository.save(reference);
            references.put(input.url(), reference);
            ConceptReferenceId id = new ConceptReferenceId(concept.getId(), reference.getId());
            ConceptReference link = relationLinks.get(id);
            if (link == null) link = ConceptReference.link(concept, reference, input.displayOrder(), input.relationNote());
            link.reviseRelation(input.displayOrder(), input.relationNote());
            link = conceptReferenceRepository.save(link);
            relationLinks.put(id, link);
            searchChangeRecorder.record(SearchChangeType.REFERENCE, reference.getId());
        }
    }

    private void upsertQuestion(NormalizedImportItem item, Map<String, Concept> concepts, Map<String, Question> questions) {
        Question question = questions.get(item.contentKey());
        List<Concept> linkedConcepts = item.conceptKeys().stream().map(concepts::get).toList();
        List<Question.ChoiceDraft> choices = item.choices().stream().map(choice -> new Question.ChoiceDraft(choice.key(), choice.content(), choice.displayOrder())).toList();
        boolean newQuestion = question == null;
        if (newQuestion) question = Question.createDraft(item.contentKey(), item.promptMarkdown(), QuestionType.valueOf(item.questionType()), QuestionDifficulty.valueOf(item.difficulty()), item.explanationMarkdown());
        else question.reviseMetadata(item.promptMarkdown(), QuestionDifficulty.valueOf(item.difficulty()), item.explanationMarkdown());
        if (newQuestion || !sameStructure(item, question)) {
            prepareChoiceOrderUpdate(question, choices);
            question.replaceStructure(QuestionType.valueOf(item.questionType()), choices, item.correctChoiceKey(), item.acceptedAnswers(), item.modelAnswer(), linkedConcepts);
        }
        question.setCanonicalStatus(QuestionStatus.valueOf(item.status()));
        Question saved = questionRepository.save(question);
        questions.put(item.contentKey(), saved);
        searchChangeRecorder.record(SearchChangeType.QUESTION, saved.getId());
    }

    private void prepareChoiceOrderUpdate(Question question, List<Question.ChoiceDraft> incomingChoices) {
        if (!choiceOrdersMayConflict(question, incomingChoices)) return;
        int maxIncomingOrder = incomingChoices.stream().mapToInt(Question.ChoiceDraft::displayOrder).max().orElse(0);
        int maxExistingOrder = question.getChoices().stream().mapToInt(choice -> choice.getDisplayOrder()).max().orElse(0);
        long offset = (long) maxIncomingOrder + 1L;
        if (offset > Integer.MAX_VALUE - (long) maxExistingOrder) throw new IllegalArgumentException("choice displayOrder values leave no safe temporary range");
        questionChoiceRepository.shiftDisplayOrders(question.getId(), (int) offset);
    }

    private static boolean choiceOrdersMayConflict(Question question, List<Question.ChoiceDraft> incomingChoices) {
        if (question.getChoices().isEmpty() || incomingChoices.isEmpty()) return false;
        Map<String, Integer> existingOrders = question.getChoices().stream()
                .collect(java.util.stream.Collectors.toMap(choice -> choice.getChoiceKey(), choice -> choice.getDisplayOrder()));
        if (existingOrders.size() != incomingChoices.size()) return true;
        return incomingChoices.stream().anyMatch(choice -> !java.util.Objects.equals(existingOrders.get(choice.choiceKey()), choice.displayOrder()));
    }

    private static int count(ImportAnalysis a, ImportClassification c) { return Math.toIntExact(a.count(c)); }

    private static boolean sameStructure(NormalizedImportItem item, Question question) {
        if (!question.getQuestionType().name().equals(item.questionType())) return false;
        List<String> choices = question.getChoices().stream().map(c -> c.getChoiceKey() + "|" + c.getContentMarkdown() + "|" + c.getDisplayOrder()).toList();
        List<String> incomingChoices = item.choices().stream().map(c -> c.key() + "|" + c.content() + "|" + c.displayOrder()).toList();
        if (!choices.equals(incomingChoices)) return false;
        List<String> answers = question.getAnswers().stream().map(a -> a.getAnswerKind() + "|" + (a.getChoice() == null ? null : a.getChoice().getChoiceKey()) + "|" + a.getAnswerText()).sorted().toList();
        List<String> incomingAnswers = new java.util.ArrayList<>();
        if (item.correctChoiceKey() != null) incomingAnswers.add("CORRECT_CHOICE|" + item.correctChoiceKey() + "|null");
        item.acceptedAnswers().forEach(a -> incomingAnswers.add("ACCEPTED_TEXT|null|" + a));
        if (item.modelAnswer() != null) incomingAnswers.add("MODEL_ANSWER|null|" + item.modelAnswer());
        if (!answers.equals(incomingAnswers.stream().sorted().toList())) return false;
        return question.getConceptLinks().stream().map(link -> link.getConcept().getContentKey()).sorted().toList()
                .equals(item.conceptKeys().stream().sorted().toList());
    }

    private static boolean shouldApply(NormalizedImportItem item, ImportAnalysis analysis) {
        return analysis.previews().stream().filter(preview -> preview.fileName().equals(item.fileName()) && preview.itemIndex() == item.itemIndex())
                .map(ImportItemPreview::classification).anyMatch(c -> c == ImportClassification.CREATED || c == ImportClassification.UPDATED);
    }
}
