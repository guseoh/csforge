package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.learning.domain.Reference;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.stereotype.Component;

/** 자동 반영의 허용 필드를 제한하고 기존 풀이 이력의 의미 변경을 차단한다. */
@Component
public class ContentSyncPolicy {
    private static final Set<String> CONCEPT_FIELDS = Set.of("title", "summary", "contentMarkdown", "references");
    private static final Set<String> QUESTION_FIELDS = Set.of("promptMarkdown", "explanationMarkdown");
    private static final Set<String> TOPIC_FIELDS = Set.of("title", "description", "displayOrder");

    public void validate(ImportAnalysis analysis, ContentSyncScope scope) {
        if (analysis.hasErrors()) throw new IllegalStateException("Preview errors block synchronization");
        validateSharedReferenceConsistency(analysis.items());
        for (var input : analysis.items()) {
            for (var ref : input.references()) {
                var old = analysis.state().references().get(ref.url());
                if (old != null) {
                    List<String> differing = differingReferenceFields(old, ref);
                    if (!differing.isEmpty()) {
                        throw new IllegalStateException("Shared reference metadata requires review: " + ref.url()
                                + " [concept=" + input.contentKey()
                                + ", fields=" + String.join(",", differing) + "]");
                    }
                }
            }
        }
        for (var item : analysis.previews()) {
            if (item.classification() == ImportClassification.SKIPPED || item.kind() == null)
                throw new IllegalStateException("Skipped input requires review");
            if ((scope == ContentSyncScope.JAVA_CONCEPTS || scope == ContentSyncScope.ALL_CONCEPTS) && item.kind() != ImportItemKind.CONCEPT
                    || (scope == ContentSyncScope.JAVA_QUESTIONS || scope == ContentSyncScope.ALL_QUESTIONS) && item.kind() != ImportItemKind.QUESTION
                    || scope == ContentSyncScope.ALL_TOPICS && item.kind() != ImportItemKind.TOPIC)
                throw new IllegalStateException("Unexpected item kind");
            if (item.classification() != ImportClassification.UPDATED) continue;
            if (item.kind() == ImportItemKind.CONCEPT) {
                if (item.diffs().stream().anyMatch(d -> !CONCEPT_FIELDS.contains(d.field())))
                    throw new IllegalStateException("Concept relationship/status change requires review");
            } else if (item.kind() == ImportItemKind.TOPIC) {
                if (item.diffs().stream().anyMatch(d -> !TOPIC_FIELDS.contains(d.field())))
                    throw new IllegalStateException("Topic identity/status change requires review");
            } else {
                if (!isSafeQuestionUpdate(analysis, item))
                    throw new IllegalStateException("Question update requires manual review: " + item.contentKey());
            }
        }
    }

    public void validateSharedReferenceConsistency(Collection<NormalizedImportItem> items) {
        Map<String, SharedReferenceDeclaration> seenByUrl = new HashMap<>();
        for (var item : items) {
            for (var ref : item.references()) {
                SharedReferenceDeclaration incoming = SharedReferenceDeclaration.from(item, ref);
                SharedReferenceDeclaration existing = seenByUrl.putIfAbsent(ref.url(), incoming);
                if (existing != null) {
                    List<String> differing = existing.differingFields(incoming);
                    if (!differing.isEmpty()) {
                        throw new IllegalStateException("Conflicting shared reference metadata in source: " + ref.url()
                                + " [first=" + existing.conceptKey()
                                + ", second=" + incoming.conceptKey()
                                + ", fields=" + String.join(",", differing) + "]");
                    }
                }
            }
        }
    }

    public boolean isSafeQuestionUpdate(ImportAnalysis analysis, ImportItemPreview item) {
        if (item.kind() != ImportItemKind.QUESTION || item.classification() != ImportClassification.UPDATED
                || item.diffs().isEmpty() || item.diffs().stream().anyMatch(diff -> !QUESTION_FIELDS.contains(diff.field()))) {
            return false;
        }
        var question = analysis.state().questions().get(item.contentKey());
        return question != null && !analysis.state().questionIdsWithAttempts().contains(question.getId());
    }

    private static List<String> differingReferenceFields(Reference existing, NormalizedReference incoming) {
        List<String> differing = new ArrayList<>();
        if (!Objects.equals(existing.getTitle(), incoming.title())) differing.add("title");
        if (!Objects.equals(existing.getLanguageCode(), incoming.language())) differing.add("language");
        if (!Objects.equals(existing.getReferenceType().name(), incoming.referenceType())) differing.add("referenceType");
        if (!Objects.equals(existing.getDepth(), incoming.depth())) differing.add("depth");
        if (!Objects.equals(existing.getRecommendation(), incoming.recommendation())) differing.add("recommendation");
        return differing;
    }

    private record SharedReferenceDeclaration(
            String conceptKey, String title, String language, String referenceType, String depth, String recommendation) {
        private static SharedReferenceDeclaration from(NormalizedImportItem item, NormalizedReference ref) {
            return new SharedReferenceDeclaration(
                    item.contentKey(), ref.title(), ref.language(), ref.referenceType(), ref.depth(), ref.recommendation());
        }

        private List<String> differingFields(SharedReferenceDeclaration other) {
            List<String> differing = new ArrayList<>();
            if (!Objects.equals(title, other.title)) differing.add("title");
            if (!Objects.equals(language, other.language)) differing.add("language");
            if (!Objects.equals(referenceType, other.referenceType)) differing.add("referenceType");
            if (!Objects.equals(depth, other.depth)) differing.add("depth");
            if (!Objects.equals(recommendation, other.recommendation)) differing.add("recommendation");
            return differing;
        }
    }
}
