package com.guseoh.csforge.importcontent.api;

import java.util.List;

/** atomic import apply API 응답이다. */
public record ImportApplyResponse(String previewDigest, ImportApplyTotalsResponse totals, List<ImportItemResponse> items) { }
