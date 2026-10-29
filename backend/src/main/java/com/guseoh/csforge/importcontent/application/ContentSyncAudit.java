package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** 배포된 원본과 DB의 차이를 쓰기 없이 보고하며 동기화 기준 확정과 구분한다. */
public record ContentSyncAudit(String manifestDigest, int sourceFiles, int created, int updated,
        int unchanged, int skipped, int errors, List<ImportItemPreview> items) {
    public ContentSyncAudit { items = List.copyOf(items); }
}
