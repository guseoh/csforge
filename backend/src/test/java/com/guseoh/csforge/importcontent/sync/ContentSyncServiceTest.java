package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.domain.ContentSyncCheckpointRepository;
import com.guseoh.csforge.importcontent.domain.ContentSyncRunRepository;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

/** ContentSyncService의 다중 배치 preflight 교차 참조 일관성 차단을 단위 검증한다. */
class ContentSyncServiceTest {
    private static final String SHA = "a".repeat(40);
    private static final String URL = "https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html";

    @Test
    void crossBatchSharedReferenceConflictFailsBeforeApply() {
        var firstFile = new CanonicalContentFile("network-http/http-state-intermediary/cookie.md",
                "first".getBytes(StandardCharsets.UTF_8));
        var secondFile = new CanonicalContentFile("network-http/http-state-intermediary/cookie-scope.md",
                "second".getBytes(StandardCharsets.UTF_8));
        var files = List.of(firstFile, secondFile);

        CanonicalContentSource source = () -> files;
        CanonicalBootstrapBatchPlanner batches = mock(CanonicalBootstrapBatchPlanner.class);
        ContentSyncPlanner planner = mock(ContentSyncPlanner.class);
        ContentImportAnalyzer analyzer = mock(ContentImportAnalyzer.class);
        ContentImportApplyService apply = mock(ContentImportApplyService.class);
        ContentImportGuard guard = mock(ContentImportGuard.class);
        ContentSyncPolicy policy = new ContentSyncPolicy();
        ContentSyncCheckpointRepository checkpoints = mock(ContentSyncCheckpointRepository.class);
        ContentSyncRunRepository runs = mock(ContentSyncRunRepository.class);

        var service = new ContentSyncService(
                source, batches, planner, analyzer, apply, guard, policy, checkpoints, runs,
                new ObjectMapper(), Clock.fixed(Instant.parse("2026-11-26T00:00:00Z"), ZoneOffset.UTC));

        var batch1Cmd = new ImportFilesCommand(List.of(new ImportSourceFile(firstFile.path(), firstFile.content())));
        var batch2Cmd = new ImportFilesCommand(List.of(new ImportSourceFile(secondFile.path(), secondFile.content())));
        when(planner.manifest(files)).thenReturn(new ContentSyncManifest(Map.of()));
        when(checkpoints.findById(ContentSyncScope.ALL_CONCEPTS.name())).thenReturn(Optional.empty());
        when(batches.plan(files)).thenReturn(new CanonicalBootstrapPlan(List.of(
                new CanonicalBootstrapBatch(1, ImportItemKind.CONCEPT, batch1Cmd, 1),
                new CanonicalBootstrapBatch(2, ImportItemKind.CONCEPT, batch2Cmd, 1)), 2, 2, 0, 2, 0));

        var emptyState = new ImportState(Map.of(), Map.of(), Map.of(), Map.of(), Map.of(),
                Map.of(), Set.of(), Map.of(), Map.of());
        var item1 = concept(firstFile.path(), "network-http.core.http-state-intermediary.cookie", "old rec");
        var item2 = concept(secondFile.path(), "network-http.core.http-state-intermediary.cookie-scope", "new rec");
        when(analyzer.analyze(batch1Cmd)).thenReturn(new ImportAnalysis(
                List.of(item1), emptyState, List.of(preview(item1)), "d1"));
        when(analyzer.analyze(batch2Cmd)).thenReturn(new ImportAnalysis(
                List.of(item2), emptyState, List.of(preview(item2)), "d2"));

        String digest = ContentSyncAuditDigest.calculate(files);
        var error = assertThrows(IllegalStateException.class,
                () -> service.synchronize(ContentSyncScope.ALL_CONCEPTS, SHA, "", digest, true));

        assertTrue(error.getMessage().startsWith("Conflicting shared reference metadata in source: " + URL),
                error.getMessage());
        assertTrue(error.getMessage().contains("fields=recommendation"), error.getMessage());
        verify(apply, never()).apply(any(), any());
        verify(checkpoints, never()).save(any());
        verify(runs, never()).save(any());
    }

    private static NormalizedImportItem concept(String path, String key, String recommendation) {
        var ref = new NormalizedReference(URL, "RFC 6265bis", "OFFICIAL", "en", "section", recommendation, 2, "note");
        return new NormalizedImportItem(
                path, 0, ImportItemKind.CONCEPT, key, null, "network-http.core.http-state-intermediary",
                "slug", "title", null, "summary", "# body", (short) 1, "PUBLISHED", 10, true,
                List.of(ref), true, null, null, null, null, List.of(), List.of(), null, List.of(), null,
                List.of(), null);
    }

    private static ImportItemPreview preview(NormalizedImportItem item) {
        return new ImportItemPreview(item.fileName(), 0, ImportItemKind.CONCEPT, item.contentKey(),
                ImportClassification.UPDATED, null, List.of(),
                List.of(new ImportFieldDiff("contentMarkdown", "old", "new")));
    }
}
