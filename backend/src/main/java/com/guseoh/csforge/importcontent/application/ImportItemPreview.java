package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** Preview 결과에서 파일 항목 하나의 분류와 차이를 표현한다. */
public record ImportItemPreview(String fileName, int itemIndex, ImportItemKind kind, String contentKey,
        ImportClassification classification, String reason, List<ImportValidationError> errors,
        List<ImportFieldDiff> diffs) {
    public ImportItemPreview {
        errors = errors == null ? List.of() : List.copyOf(errors);
        diffs = diffs == null ? List.of() : List.copyOf(diffs);
    }
}
