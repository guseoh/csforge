package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.learning.domain.Reference;
import com.guseoh.csforge.learning.domain.ReferenceType;
import com.guseoh.csforge.question.domain.Question;
import java.util.*;
import org.junit.jupiter.api.Test;

class ContentSyncPolicyTest {
    private static final String REF_URL = "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html";
    private final ContentSyncPolicy policy = new ContentSyncPolicy();

    @Test void attemptedQuestionCannotBeReinterpretedEvenForTextOnlyChanges() {
        assertThrows(IllegalStateException.class, () -> policy.validate(question(true, "explanationMarkdown"), ContentSyncScope.JAVA_QUESTIONS));
    }

    @Test void unattemptedQuestionAllowsTextButNotAnswerOrStructureChanges() {
        assertDoesNotThrow(() -> policy.validate(question(false, "explanationMarkdown"), ContentSyncScope.JAVA_QUESTIONS));
        assertThrows(IllegalStateException.class, () -> policy.validate(question(false, "structure"), ContentSyncScope.JAVA_QUESTIONS));
        assertThrows(IllegalStateException.class, () -> policy.validate(question(false, "status"), ContentSyncScope.JAVA_QUESTIONS));
    }

    @Test void sharedReferenceMetadataChangeIncludesConceptAndDifferingFields() {
        Reference existing = Reference.create(REF_URL, "RFC 6265bis", ReferenceType.OFFICIAL, "en", "section", "old rec");
        NormalizedReference changed = new NormalizedReference(
                REF_URL, "RFC 6265bis", "OFFICIAL", "en", "section", "new rec", 2, "concept-local note");
        var item = conceptItem("network-http.core.http-state-intermediary.cookie", List.of(changed));
        var state = new ImportState(Map.of(), Map.of(), Map.of(), Map.of(), Map.of(REF_URL, existing),
                Map.of(), Set.of(), Map.of(), Map.of());
        var analysis = new ImportAnalysis(List.of(item), state, List.of(conceptPreview(item.contentKey())), "digest");

        var error = assertThrows(IllegalStateException.class,
                () -> policy.validate(analysis, ContentSyncScope.ALL_CONCEPTS));
        assertTrue(error.getMessage().startsWith("Shared reference metadata requires review: " + REF_URL),
                error.getMessage());
        assertTrue(error.getMessage().contains("concept=network-http.core.http-state-intermediary.cookie"),
                error.getMessage());
        assertTrue(error.getMessage().contains("fields=recommendation"), error.getMessage());
    }

    @Test void conceptLocalRelationNoteAndDisplayOrderChangesAreAllowed() {
        Reference existing = Reference.create(REF_URL, "RFC 6265bis", ReferenceType.OFFICIAL, "en", "section", "same rec");
        NormalizedReference firstRef = new NormalizedReference(
                REF_URL, "RFC 6265bis", "OFFICIAL", "en", "section", "same rec", 1, "note A");
        NormalizedReference secondRef = new NormalizedReference(
                REF_URL, "RFC 6265bis", "OFFICIAL", "en", "section", "same rec", 3, "note B");
        var first = conceptItem("network-http.core.http-state-intermediary.cookie", List.of(firstRef));
        var second = conceptItem("network-http.core.http-state-intermediary.set-cookie", List.of(secondRef));
        var state = new ImportState(Map.of(), Map.of(), Map.of(), Map.of(), Map.of(REF_URL, existing),
                Map.of(), Set.of(), Map.of(), Map.of());
        var analysis = new ImportAnalysis(List.of(first, second), state,
                List.of(conceptPreview(first.contentKey()), conceptPreview(second.contentKey())), "digest");

        assertDoesNotThrow(() -> policy.validate(analysis, ContentSyncScope.ALL_CONCEPTS));
    }

    @Test void conflictingSharedReferenceMetadataWithinSourceFailsFast() {
        NormalizedReference firstRef = new NormalizedReference(
                REF_URL, "RFC 6265bis", "OFFICIAL", "en", "section", "old rec", 2, "note A");
        NormalizedReference secondRef = new NormalizedReference(
                REF_URL, "RFC 6265bis", "OFFICIAL", "en", "section", "new rec", 2, "note B");
        var first = conceptItem("network-http.core.http-state-intermediary.cookie", List.of(firstRef));
        var second = conceptItem("network-http.core.http-state-intermediary.cookie-scope", List.of(secondRef));

        var error = assertThrows(IllegalStateException.class,
                () -> policy.validateSharedReferenceConsistency(List.of(first, second)));
        assertTrue(error.getMessage().startsWith("Conflicting shared reference metadata in source: " + REF_URL),
                error.getMessage());
        assertTrue(error.getMessage().contains("first=network-http.core.http-state-intermediary.cookie"),
                error.getMessage());
        assertTrue(error.getMessage().contains("second=network-http.core.http-state-intermediary.cookie-scope"),
                error.getMessage());
        assertTrue(error.getMessage().contains("fields=recommendation"), error.getMessage());
    }

    private ImportAnalysis question(boolean attempted, String field) {
        var q = mock(Question.class); when(q.getId()).thenReturn(1L);
        var state = new ImportState(Map.of(), Map.of(), Map.of(), Map.of("q", q), Map.of(), Map.of(),
                attempted ? Set.of(1L) : Set.of(), Map.of(), Map.of());
        var item = new ImportItemPreview("java/t/questions.json", 0, ImportItemKind.QUESTION, "q",
                ImportClassification.UPDATED, null, List.of(), List.of(new ImportFieldDiff(field, "old", "new")));
        return new ImportAnalysis(List.of(), state, List.of(item), "digest");
    }

    private static NormalizedImportItem conceptItem(String contentKey, List<NormalizedReference> refs) {
        return new NormalizedImportItem(
                contentKey + ".md", 0, ImportItemKind.CONCEPT, contentKey, null, "network-http.core.http-state-intermediary",
                "slug", "title", null, "summary", "# body", (short) 1, "PUBLISHED", 10, true,
                refs, true, null, null, null, null, List.of(), List.of(), null, List.of(), null, List.of(), null);
    }

    private static ImportItemPreview conceptPreview(String contentKey) {
        return new ImportItemPreview(contentKey + ".md", 0, ImportItemKind.CONCEPT, contentKey,
                ImportClassification.UPDATED, null, List.of(),
                List.of(new ImportFieldDiff("references", "old", "new")));
    }
}
