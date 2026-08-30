package com.guseoh.csforge.importcontent.api;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import com.guseoh.csforge.importcontent.application.ImportApplyResult;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.importcontent.application.ImportItemPreview;
import com.guseoh.csforge.importcontent.application.ImportPreviewResult;

/** application import 결과를 HTTP response로 변환한다. */
@Component
public class ImportApiMapper {
    public ImportPreviewResponse toPreview(ImportPreviewResult result) {
        Map<String, Long> fileCounts = result.items().stream().collect(Collectors.groupingBy(ImportItemPreview::fileName, java.util.LinkedHashMap::new, Collectors.counting()));
        return new ImportPreviewResponse(result.previewDigest(), fileCounts.entrySet().stream().map(e -> new ImportFileSummaryResponse(e.getKey(), Math.toIntExact(e.getValue()))).toList(), totals(result.created(), result.updated(), result.unchanged(), result.skipped(), result.errors()), result.items().stream().map(this::toItem).toList(), result.canApply());
    }
    public ImportApplyResponse toApply(ImportApplyResult result) { return new ImportApplyResponse(result.previewDigest(), new ImportApplyTotalsResponse(result.created(), result.updated(), result.unchanged(), result.skipped(), result.failed()), result.items().stream().map(this::toItem).toList()); }
    private ImportItemResponse toItem(ImportItemPreview item) { return new ImportItemResponse(item.fileName(), item.itemIndex(), item.kind(), item.contentKey(), item.classification(), item.reason(), item.errors().stream().map(e -> new ImportValidationErrorResponse(e.path(), e.message())).toList(), item.diffs().stream().map(d -> new ImportFieldDiffResponse(d.field(), d.before(), d.after())).toList()); }
    private static ImportTotalsResponse totals(int created, int updated, int unchanged, int skipped, int errors) { return new ImportTotalsResponse(created, updated, unchanged, skipped, errors); }
}
