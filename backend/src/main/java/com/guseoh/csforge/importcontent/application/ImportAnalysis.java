package com.guseoh.csforge.importcontent.application;

import java.util.List;

/** Preview와 apply가 공유하는 동일한 입력 분석 결과이다. */
public record ImportAnalysis(List<NormalizedImportItem> items, ImportState state,
        List<ImportItemPreview> previews, String digest) {
    public ImportAnalysis { items = List.copyOf(items); previews = List.copyOf(previews); }
    public long count(ImportClassification classification) { return previews.stream().filter(item -> item.classification() == classification).count(); }
    public boolean hasErrors() { return previews.stream().anyMatch(item -> item.classification() == ImportClassification.ERROR); }
}
