package com.guseoh.csforge.importcontent.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;

/** 원본 식별 및 전체 batch 진단이 쓰기 경로에 의존하지 않는지 검증한다. */
class ContentSyncAuditServiceTest {
    @Test
    void manifestIsIndependentOfEnumerationButDetectsPathAndContentChanges() {
        var a = file("java/a.md", "a");
        var b = file("java/b.md", "b");
        assertEquals(ContentSyncAuditService.manifestDigest(List.of(a, b)),
                ContentSyncAuditService.manifestDigest(List.of(b, a)));
        assertNotEquals(ContentSyncAuditService.manifestDigest(List.of(a)),
                ContentSyncAuditService.manifestDigest(List.of(file("java/a.md", "changed"))));
        assertNotEquals(ContentSyncAuditService.manifestDigest(List.of(a)),
                ContentSyncAuditService.manifestDigest(List.of(file("java/moved.md", "a"))));
    }

    @Test
    void auditsEveryBatchIncludingErrorsWithoutAdvancingAnyBaseline() {
        var files = List.of(file("java/a.md", "a"));
        var planner = mock(CanonicalBootstrapBatchPlanner.class);
        var preview = mock(ContentImportPreviewService.class);
        var command = new ImportFilesCommand(List.of());
        when(planner.plan(files)).thenReturn(new CanonicalBootstrapPlan(List.of(
                new CanonicalBootstrapBatch(1, ImportItemKind.CONCEPT, command, 1),
                new CanonicalBootstrapBatch(2, ImportItemKind.QUESTION, command, 1)), 1, 0, 1, 1, 2));
        when(preview.preview(command)).thenReturn(
                new ImportPreviewResult("a", 0, 1, 0, 0, 0, List.of(), true),
                new ImportPreviewResult("b", 0, 0, 0, 0, 1, List.of(), false));
        var result = new ContentSyncAuditService(() -> files, planner, preview).audit();
        assertEquals(1, result.updated());
        assertEquals(1, result.errors());
        verify(preview, times(2)).preview(command);
    }

    private static CanonicalContentFile file(String path, String value) {
        return new CanonicalContentFile(path, value.getBytes(StandardCharsets.UTF_8));
    }
}
