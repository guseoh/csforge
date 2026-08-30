package com.guseoh.csforge.importcontent.api;

import java.util.List;

/** DB mutation 전 import preview API 응답이다. */
public record ImportPreviewResponse(String previewDigest, List<ImportFileSummaryResponse> files,
        ImportTotalsResponse totals, List<ImportItemResponse> items, boolean canApply) { }
