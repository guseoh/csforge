package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;

import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import com.guseoh.csforge.learning.domain.Concept;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.Topic;
import com.guseoh.csforge.question.domain.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 입력을 검증하고 현재 JPA 상태와 deterministic diff를 계산한다. */
@Component
@RequiredArgsConstructor
public class ContentImportAnalyzer {
    private final ContentImportParser parser;
    private final ContentImportValidator validator;
    private final ContentImportStateLoader stateLoader;

    public ImportAnalysis analyze(ImportFilesCommand command) {
        validateBounds(command);
        List<NormalizedImportItem> parsedItems = parser.parse(command);
        validateItemCount(parsedItems.size());
        List<NormalizedImportItem> items = validator.validate(parsedItems);
        ImportState state = stateLoader.load(items);
        Set<String> batchTopics = items.stream()
                .filter(item -> item.kind() == ImportItemKind.TOPIC)
                .map(NormalizedImportItem::contentKey)
                .collect(Collectors.toSet());
        Set<String> batchConcepts = items.stream()
                .filter(item -> item.kind() == ImportItemKind.CONCEPT)
                .map(NormalizedImportItem::contentKey)
                .collect(Collectors.toSet());
        List<ImportItemPreview> previews = new ArrayList<>();
        Map<String, NormalizedImportItem> definitions = new HashMap<>();
        for (NormalizedImportItem item : items) {
            String identity = item.kind() + ":" + item.contentKey();
            NormalizedImportItem previous = item.contentKey() == null ? null : definitions.putIfAbsent(identity, item);
            if (previous != null && previous.sameCanonicalPayload(item)) {
                previews.add(preview(
                        item,
                        ImportClassification.SKIPPED,
                        "동일한 항목이 batch에 중복되어 한 번만 반영됩니다",
                        List.of(),
                        List.of()));
            } else {
                previews.add(analyzeItem(item, state, batchTopics, batchConcepts));
            }
        }
        return new ImportAnalysis(items, state, previews, ContentImportDigest.calculate(items, state));
    }

    private ImportItemPreview analyzeItem(
            NormalizedImportItem item,
            ImportState state,
            Set<String> batchTopics,
            Set<String> batchConcepts) {
        List<ImportValidationError> errors = new ArrayList<>(item.errors());
        if (item.isSkipped()) {
            return preview(item, ImportClassification.SKIPPED, item.skipReason(), errors, List.of());
        }
        if (item.kind() == ImportItemKind.TOPIC && !state.areas().containsKey(item.areaSlug())) {
            errors.add(new ImportValidationError("areaSlug", "존재하지 않는 LearningArea입니다"));
        }
        if (item.kind() == ImportItemKind.TOPIC) {
            Topic conflict = state.topicSlugConflicts().get(item.areaSlug() + "\u0000" + item.slug());
            if (conflict != null && !conflict.getContentKey().equals(item.contentKey())) {
                errors.add(new ImportValidationError("slug", "같은 LearningArea에 동일한 slug가 이미 존재합니다"));
            }
        }
        if (item.kind() == ImportItemKind.CONCEPT
                && !state.topics().containsKey(item.topicContentKey())
                && !batchTopics.contains(item.topicContentKey())) {
            errors.add(new ImportValidationError("topicContentKey", "존재하지 않는 Topic입니다"));
        }
        if (item.kind() == ImportItemKind.CONCEPT) {
            Concept conflict = state.conceptSlugConflicts().get(item.topicContentKey() + "\u0000" + item.slug());
            if (conflict != null && !conflict.getContentKey().equals(item.contentKey())) {
                errors.add(new ImportValidationError("slug", "같은 Topic에 동일한 slug가 이미 존재합니다"));
            }
        }
        if (item.kind() == ImportItemKind.QUESTION) {
            item.conceptKeys().stream()
                    .filter(key -> !state.concepts().containsKey(key) && !batchConcepts.contains(key))
                    .forEach(key -> errors.add(new ImportValidationError("conceptKeys", "존재하지 않는 Concept: " + key)));
        }
        if (!errors.isEmpty()) {
            return preview(item, ImportClassification.ERROR, "검증 오류", errors, List.of());
        }
        Object existing = existing(item, state);
        if (existing == null) {
            return preview(item, ImportClassification.CREATED, null, List.of(), List.of());
        }
        List<ImportFieldDiff> diffs = diffs(item, existing, state);
        if (item.kind() == ImportItemKind.QUESTION && !QuestionStructureComparator.matches(item, (Question) existing)
                && state.questionIdsWithAttempts().contains(((Question) existing).getId())) {
            diffs = new ArrayList<>(diffs);
            diffs.add(new ImportFieldDiff("history", "Attempts exist", "structural question update is prohibited"));
            return preview(
                    item,
                    ImportClassification.ERROR,
                    "Attempts가 있는 Question의 구조 변경은 허용되지 않습니다",
                    List.of(new ImportValidationError("question", "historical Attempts가 있어 구조를 변경할 수 없습니다")),
                    diffs);
        }
        return preview(
                item,
                diffs.isEmpty() ? ImportClassification.UNCHANGED : ImportClassification.UPDATED,
                null,
                List.of(),
                diffs);
    }

    private static Object existing(NormalizedImportItem item, ImportState state) {
        return switch (item.kind()) {
            case TOPIC -> state.topics().get(item.contentKey());
            case CONCEPT -> state.concepts().get(item.contentKey());
            case QUESTION -> state.questions().get(item.contentKey());
        };
    }

    private static List<ImportFieldDiff> diffs(NormalizedImportItem item, Object existing, ImportState state) {
        List<ImportFieldDiff> result = new ArrayList<>();
        if (item.kind() == ImportItemKind.TOPIC) {
            Topic topic = (Topic) existing;
            diff(result, "areaSlug", topic.getLearningArea().getSlug(), item.areaSlug());
            diff(result, "slug", topic.getSlug(), item.slug());
            diff(result, "title", topic.getTitle(), item.title());
            diff(result, "description", topic.getDescription(), item.description());
            diff(result, "displayOrder", topic.getDisplayOrder(), item.displayOrder());
            diff(result, "active", topic.isActive(), item.active());
        } else if (item.kind() == ImportItemKind.CONCEPT) {
            Concept concept = (Concept) existing;
            diff(result, "topicContentKey", concept.getTopic().getContentKey(), item.topicContentKey());
            diff(result, "slug", concept.getSlug(), item.slug());
            diff(result, "title", concept.getTitle(), item.title());
            diff(result, "summary", concept.getSummary(), item.summary());
            diff(result, "contentMarkdown", concept.getContentMarkdown(), item.contentMarkdown());
            diff(result, "level", concept.getLevel(), item.level());
            diff(result, "status", concept.getStatus(), item.status());
            diff(result, "displayOrder", concept.getDisplayOrder(), item.displayOrder());
            diffReferences(result, concept, item, state);
        } else {
            Question question = (Question) existing;
            diff(result, "promptMarkdown", question.getPromptMarkdown(), item.promptMarkdown());
            diff(result, "questionType", question.getQuestionType(), item.questionType());
            diff(result, "difficulty", question.getDifficulty(), item.difficulty());
            diff(result, "status", question.getStatus(), item.status());
            diff(result, "explanationMarkdown", question.getExplanationMarkdown(), item.explanationMarkdown());
            if (!QuestionStructureComparator.matches(item, question)) {
                diff(result, "structure", "existing", "imported");
            }
        }
        return result;
    }

    private static void diffReferences(List<ImportFieldDiff> result, Concept concept, NormalizedImportItem item, ImportState state) {
        if (!item.referencesDeclared()) return;
        String before = state.conceptReferences().getOrDefault(concept.getId(), List.of()).stream()
                .map(link -> link.getReference().getUrl() + "|" + link.getReference().getTitle() + "|"
                        + link.getReference().getReferenceType() + "|" + link.getReference().getLanguageCode() + "|"
                        + link.getReference().getDepth() + "|" + link.getReference().getRecommendation() + "|"
                        + link.getDisplayOrder() + "|" + link.getRelationNote())
                .sorted()
                .toList()
                .toString();
        String after = item.references().stream()
                .map(ref -> ref.url() + "|" + ref.title() + "|" + ref.referenceType() + "|" + ref.language() + "|"
                        + ref.depth() + "|" + ref.recommendation() + "|" + ref.displayOrder() + "|" + ref.relationNote())
                .sorted()
                .toList()
                .toString();
        diff(result, "references", before, after);
    }

    private static void diff(List<ImportFieldDiff> diffs, String field, Object before, Object after) {
        String left = before == null ? null : String.valueOf(before);
        String right = after == null ? null : String.valueOf(after);
        if (!Objects.equals(left, right)) {
            diffs.add(new ImportFieldDiff(field, compact(left), compact(right)));
        }
    }

    private static String compact(String value) {
        return value != null && value.length() > 2000 ? value.substring(0, 2000) + "…" : value;
    }

    private static ImportItemPreview preview(
            NormalizedImportItem item,
            ImportClassification classification,
            String reason,
            List<ImportValidationError> errors,
            List<ImportFieldDiff> diffs) {
        return new ImportItemPreview(item.fileName(), item.itemIndex(), item.kind(), item.contentKey(), classification, reason, errors, diffs);
    }
    private static void validateBounds(ImportFilesCommand command) {
        if (command.files().isEmpty()) throw new ImportBoundsException("At least one file is required");
        if (command.files().size() > ImportBatchLimits.MAX_FILES_PER_BATCH) throw new ImportBoundsException("A batch may contain at most " + ImportBatchLimits.MAX_FILES_PER_BATCH + " files");
        long total = 0;
        for (ImportSourceFile file : command.files()) {
            if (file.content().length > ImportBatchLimits.MAX_FILE_BYTES) throw new ImportBoundsException("Each file may be at most 2 MiB");
            total += file.content().length;
        }
        if (total > ImportBatchLimits.MAX_TOTAL_BYTES) throw new ImportBoundsException("A batch may be at most 20 MiB");
    }

    private static void validateItemCount(int count) {
        if (count > ImportBatchLimits.MAX_ITEMS_PER_BATCH) throw new ImportBoundsException("A batch may contain at most " + ImportBatchLimits.MAX_ITEMS_PER_BATCH + " items");
    }
}
