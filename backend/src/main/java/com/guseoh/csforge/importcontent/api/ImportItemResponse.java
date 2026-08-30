package com.guseoh.csforge.importcontent.api;

import java.util.List;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.importcontent.application.ImportItemKind;

/** import item 하나의 preview/apply 결과 API 모델이다. */
public record ImportItemResponse(String fileName, int itemIndex, ImportItemKind kind, String contentKey,
        ImportClassification classification, String reason, List<ImportValidationErrorResponse> errors,
        List<ImportFieldDiffResponse> diffs) { }
