package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** DB를 변경하지 않고 반환하는 가져오기 preview 결과이다. */
public record ImportPreviewResult(String previewDigest, int created, int updated, int unchanged,
        int skipped, int errors, List<ImportItemPreview> items, boolean canApply) {
    public ImportPreviewResult { items = List.copyOf(items); }
}
