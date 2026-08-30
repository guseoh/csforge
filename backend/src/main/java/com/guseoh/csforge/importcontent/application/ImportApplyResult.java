package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** 한 atomic apply의 변경 결과이다. */
public record ImportApplyResult(String previewDigest, int created, int updated, int unchanged,
        int skipped, int failed, List<ImportItemPreview> items) {
    public ImportApplyResult { items = List.copyOf(items); }
}
