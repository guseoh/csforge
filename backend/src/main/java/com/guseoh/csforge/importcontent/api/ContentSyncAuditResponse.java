package com.guseoh.csforge.importcontent.api;

import com.guseoh.csforge.importcontent.application.ContentSyncAudit;
import java.util.List;

/** 원문과 개인 데이터를 노출하지 않는 필드 수준 진단 응답이다. */
public record ContentSyncAuditResponse(String manifestDigest, int sourceFiles, int created,
        int updated, int unchanged, int skipped, int errors, List<Item> items) {
    public record Item(String fileName, String contentKey, String kind, String classification,
            List<String> changedFields, List<String> errorFields) { }

    public static ContentSyncAuditResponse from(ContentSyncAudit audit) {
        return new ContentSyncAuditResponse(audit.manifestDigest(), audit.sourceFiles(), audit.created(),
                audit.updated(), audit.unchanged(), audit.skipped(), audit.errors(), audit.items().stream()
                .map(item -> new Item(item.fileName(), item.contentKey(), item.kind() == null ? null : item.kind().name(),
                        item.classification().name(), item.diffs().stream().map(diff -> diff.field()).toList(),
                        item.errors().stream().map(error -> error.path()).toList())).toList());
    }
}
