package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.question.domain.Question;
import java.util.*;
import org.junit.jupiter.api.Test;

class ContentSyncPolicyTest {
    private final ContentSyncPolicy policy = new ContentSyncPolicy();

    @Test void attemptedQuestionCannotBeReinterpretedEvenForTextOnlyChanges() {
        assertThrows(IllegalStateException.class, () -> policy.validate(question(true, "explanationMarkdown"), ContentSyncScope.JAVA_QUESTIONS));
    }

    @Test void unattemptedQuestionAllowsTextButNotAnswerOrStructureChanges() {
        assertDoesNotThrow(() -> policy.validate(question(false, "explanationMarkdown"), ContentSyncScope.JAVA_QUESTIONS));
        assertThrows(IllegalStateException.class, () -> policy.validate(question(false, "structure"), ContentSyncScope.JAVA_QUESTIONS));
        assertThrows(IllegalStateException.class, () -> policy.validate(question(false, "status"), ContentSyncScope.JAVA_QUESTIONS));
    }

    private ImportAnalysis question(boolean attempted, String field) {
        var q = mock(Question.class); when(q.getId()).thenReturn(1L);
        var state = new ImportState(Map.of(), Map.of(), Map.of(), Map.of("q", q), Map.of(), Map.of(),
                attempted ? Set.of(1L) : Set.of(), Map.of(), Map.of());
        var item = new ImportItemPreview("java/t/questions.json", 0, ImportItemKind.QUESTION, "q",
                ImportClassification.UPDATED, null, List.of(), List.of(new ImportFieldDiff(field, "old", "new")));
        return new ImportAnalysis(List.of(), state, List.of(item), "digest");
    }
}
