package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BiConsumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.ConceptReference;
import com.guseoh.csforge.learning.domain.ContentStatus;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.Question;
import com.guseoh.csforge.question.domain.QuestionAnswerKind;
import com.guseoh.csforge.question.domain.QuestionStatus;
import com.guseoh.csforge.question.domain.QuestionType;

/** 입력을 검증하고 현재 JPA 상태와 deterministic diff를 계산한다. */
@Component
@RequiredArgsConstructor
public class ContentImportAnalyzer {
    private final ContentImportParser parser;
    private final ContentImportValidator validator;
    private final ContentImportStateLoader stateLoader;

    public ImportAnalysis analyze(ImportFilesCommand command) {
        validateBounds(command);
        List<NormalizedImportItem> items = validator.validate(parser.parse(command));
        ImportState state = stateLoader.load(items);
        Set<String> batchTopics = items.stream().filter(i -> i.kind() == ImportItemKind.TOPIC).map(NormalizedImportItem::contentKey).collect(java.util.stream.Collectors.toSet());
        Set<String> batchConcepts = items.stream().filter(i -> i.kind() == ImportItemKind.CONCEPT).map(NormalizedImportItem::contentKey).collect(java.util.stream.Collectors.toSet());
        List<ImportItemPreview> previews = new ArrayList<>();
        Map<String, NormalizedImportItem> definitions = new HashMap<>();
        for (NormalizedImportItem item : items) {
            String identity = item.kind() + ":" + item.contentKey();
            NormalizedImportItem previous = item.contentKey() == null ? null : definitions.putIfAbsent(identity, item);
            if (previous != null && previous.sameCanonicalPayload(item)) previews.add(preview(item, ImportClassification.SKIPPED, "동일한 항목이 batch에 중복되어 한 번만 반영됩니다", List.of(), List.of()));
            else previews.add(analyzeItem(item, state, batchTopics, batchConcepts));
        }
        return new ImportAnalysis(items, state, previews, ContentImportDigest.calculate(items, state));
    }

    private ImportItemPreview analyzeItem(NormalizedImportItem item, ImportState state, Set<String> batchTopics, Set<String> batchConcepts) {
        List<ImportValidationError> errors = new ArrayList<>(item.errors());
        if (item.isSkipped()) return preview(item, ImportClassification.SKIPPED, item.skipReason(), errors, List.of());
        if (item.kind() == ImportItemKind.TOPIC && !state.areas().containsKey(item.areaSlug())) errors.add(new ImportValidationError("areaSlug", "존재하지 않는 LearningArea입니다"));
        if (item.kind() == ImportItemKind.CONCEPT && !state.topics().containsKey(item.topicContentKey()) && !batchTopics.contains(item.topicContentKey())) errors.add(new ImportValidationError("topicContentKey", "존재하지 않는 Topic입니다"));
        if (item.kind() == ImportItemKind.QUESTION) item.conceptKeys().stream().filter(key -> !state.concepts().containsKey(key) && !batchConcepts.contains(key)).forEach(key -> errors.add(new ImportValidationError("conceptKeys", "존재하지 않는 Concept: " + key)));
        if (!errors.isEmpty()) return preview(item, ImportClassification.ERROR, "검증 오류", errors, List.of());
        Object existing = existing(item, state);
        if (existing == null) return preview(item, ImportClassification.CREATED, null, List.of(), List.of());
        List<ImportFieldDiff> diffs = diffs(item, existing, state);
        if (item.kind() == ImportItemKind.QUESTION && structuralChanged(item, (Question) existing)
                && state.questionIdsWithAttempts().contains(((Question) existing).getId())) {
            diffs = new ArrayList<>(diffs); diffs.add(new ImportFieldDiff("history", "Attempts exist", "structural question update is prohibited"));
            return preview(item, ImportClassification.ERROR, "Attempts가 있는 Question의 구조 변경은 허용되지 않습니다", List.of(new ImportValidationError("question", "historical Attempts가 있어 구조를 변경할 수 없습니다")), diffs);
        }
        return preview(item, diffs.isEmpty() ? ImportClassification.UNCHANGED : ImportClassification.UPDATED, null, List.of(), diffs);
    }

    private static Object existing(NormalizedImportItem item, ImportState state) { return switch (item.kind()) { case TOPIC -> state.topics().get(item.contentKey()); case CONCEPT -> state.concepts().get(item.contentKey()); case QUESTION -> state.questions().get(item.contentKey()); }; }

    private static List<ImportFieldDiff> diffs(NormalizedImportItem item, Object existing, ImportState state) {
        List<ImportFieldDiff> result = new ArrayList<>();
        if (item.kind() == ImportItemKind.TOPIC) {
            Topic t = (Topic) existing; diff(result, "areaSlug", t.getLearningArea().getSlug(), item.areaSlug()); diff(result, "slug", t.getSlug(), item.slug()); diff(result, "title", t.getTitle(), item.title()); diff(result, "description", t.getDescription(), item.description()); diff(result, "displayOrder", t.getDisplayOrder(), item.displayOrder()); diff(result, "active", t.isActive(), item.active());
        } else if (item.kind() == ImportItemKind.CONCEPT) {
            Concept c = (Concept) existing; diff(result, "topicContentKey", c.getTopic().getContentKey(), item.topicContentKey()); diff(result, "slug", c.getSlug(), item.slug()); diff(result, "title", c.getTitle(), item.title()); diff(result, "summary", c.getSummary(), item.summary()); diff(result, "contentMarkdown", c.getContentMarkdown(), item.contentMarkdown()); diff(result, "level", c.getLevel(), item.level()); diff(result, "status", c.getStatus(), item.status()); diff(result, "displayOrder", c.getDisplayOrder(), item.displayOrder()); diffReferences(result, c, item, state);
        } else {
            Question q = (Question) existing; diff(result, "promptMarkdown", q.getPromptMarkdown(), item.promptMarkdown()); diff(result, "questionType", q.getQuestionType(), item.questionType()); diff(result, "difficulty", q.getDifficulty(), item.difficulty()); diff(result, "status", q.getStatus(), item.status()); diff(result, "explanationMarkdown", q.getExplanationMarkdown(), item.explanationMarkdown()); if (structuralChanged(item, q)) diff(result, "structure", "existing", "imported");
        }
        return result;
    }

    private static void diffReferences(List<ImportFieldDiff> result, Concept c, NormalizedImportItem item, ImportState state) {
        if (!item.referencesDeclared()) return;
        String before = state.conceptReferences().getOrDefault(c.getId(), List.of()).stream().map(link -> link.getReference().getUrl() + "|" + link.getReference().getTitle() + "|" + link.getReference().getReferenceType() + "|" + link.getReference().getLanguageCode() + "|" + link.getReference().getDepth() + "|" + link.getReference().getRecommendation() + "|" + link.getDisplayOrder() + "|" + link.getRelationNote()).sorted().toList().toString();
        String after = item.references().stream().map(ref -> ref.url() + "|" + ref.title() + "|" + ref.referenceType() + "|" + ref.language() + "|" + ref.depth() + "|" + ref.recommendation() + "|" + ref.displayOrder() + "|" + ref.relationNote()).sorted().toList().toString();
        diff(result, "references", before, after);
    }

    private static boolean structuralChanged(NormalizedImportItem item, Question q) {
        if (q.getQuestionType().name().equals(item.questionType()) == false) return true;
        List<String> choices = q.getChoices().stream().map(c -> c.getChoiceKey() + "|" + c.getContentMarkdown() + "|" + c.getDisplayOrder()).toList(); List<String> incomingChoices = item.choices().stream().map(c -> c.key() + "|" + c.content() + "|" + c.displayOrder()).toList(); if (!choices.equals(incomingChoices)) return true;
        List<String> answers = q.getAnswers().stream().map(a -> a.getAnswerKind() + "|" + (a.getChoice() == null ? null : a.getChoice().getChoiceKey()) + "|" + a.getAnswerText()).sorted().toList(); List<String> incomingAnswers = new ArrayList<>(); if (item.correctChoiceKey() != null) incomingAnswers.add(QuestionAnswerKind.CORRECT_CHOICE + "|" + item.correctChoiceKey() + "|null"); item.acceptedAnswers().forEach(a -> incomingAnswers.add(QuestionAnswerKind.ACCEPTED_TEXT + "|null|" + a)); if (item.modelAnswer() != null) incomingAnswers.add(QuestionAnswerKind.MODEL_ANSWER + "|null|" + item.modelAnswer()); if (!answers.equals(incomingAnswers.stream().sorted().toList())) return true;
        List<String> concepts = q.getConceptLinks().stream().map(l -> l.getConcept().getContentKey()).sorted().toList(); return !concepts.equals(item.conceptKeys().stream().sorted().toList());
    }

    private static void diff(List<ImportFieldDiff> diffs, String field, Object before, Object after) { String left = before == null ? null : String.valueOf(before); String right = after == null ? null : String.valueOf(after); if (!java.util.Objects.equals(left, right)) diffs.add(new ImportFieldDiff(field, compact(left), compact(right))); }
    private static String compact(String value) { return value != null && value.length() > 2000 ? value.substring(0, 2000) + "…" : value; }
    private static ImportItemPreview preview(NormalizedImportItem item, ImportClassification classification, String reason, List<ImportValidationError> errors, List<ImportFieldDiff> diffs) { return new ImportItemPreview(item.fileName(), item.itemIndex(), item.kind(), item.contentKey(), classification, reason, errors, diffs); }
    private static void validateBounds(ImportFilesCommand command) { if (command.files().isEmpty()) throw new ImportBoundsException("At least one file is required"); if (command.files().size() > 100) throw new ImportBoundsException("A batch may contain at most 100 files"); long total = 0; for (ImportSourceFile file : command.files()) { if (file.content().length > 2 * 1024 * 1024) throw new ImportBoundsException("Each file may be at most 2 MiB"); total += file.content().length; } if (total > 20L * 1024 * 1024) throw new ImportBoundsException("A batch may be at most 20 MiB"); }
}
