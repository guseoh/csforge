package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

/** 모든 canonical batch를 같은 읽기 snapshot에서 비교하고 원본 manifest를 식별한다. */
@Service
@RequiredArgsConstructor
public class ContentSyncAuditService {
    private final CanonicalContentSource source;
    private final CanonicalBootstrapBatchPlanner planner;
    private final ContentImportPreviewService previewService;

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ContentSyncAudit audit() {
        var files = source.load();
        var plan = planner.plan(files);
        var items = new ArrayList<ImportItemPreview>();
        int created = 0, updated = 0, unchanged = 0, skipped = 0, errors = 0;
        for (var batch : plan.batches()) {
            var preview = previewService.preview(batch.command());
            items.addAll(preview.items());
            created += preview.created();
            updated += preview.updated();
            unchanged += preview.unchanged();
            skipped += preview.skipped();
            errors += preview.errors();
        }
        return new ContentSyncAudit(manifestDigest(files), files.size(), created, updated,
                unchanged, skipped, errors, items);
    }

    static String manifestDigest(java.util.List<CanonicalContentFile> files) {
        return ContentSyncAuditDigest.calculate(files);
    }
}
