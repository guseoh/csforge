package com.guseoh.csforge.importcontent.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** canonical DB를 바꾸지 않고 import preview를 계산한다. */
@Service
@RequiredArgsConstructor
public class ContentImportPreviewService {
    private final ContentImportAnalyzer analyzer;

    @Transactional(readOnly = true)
    public ImportPreviewResult preview(ImportFilesCommand command) {
        ImportAnalysis analysis = analyzer.analyze(command);
        return new ImportPreviewResult(analysis.digest(), count(analysis, ImportClassification.CREATED), count(analysis, ImportClassification.UPDATED), count(analysis, ImportClassification.UNCHANGED), count(analysis, ImportClassification.SKIPPED), count(analysis, ImportClassification.ERROR), analysis.previews(), !analysis.hasErrors());
    }

    private static int count(ImportAnalysis analysis, ImportClassification classification) { return Math.toIntExact(analysis.count(classification)); }
}
