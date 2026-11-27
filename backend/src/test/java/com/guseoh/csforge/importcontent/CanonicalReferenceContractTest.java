package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import com.guseoh.csforge.importcontent.application.NormalizedImportItem;
import com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource;
import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import com.guseoh.csforge.importcontent.sync.ContentSyncPolicy;
import com.guseoh.csforge.importcontent.sync.ContentSyncScope;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

/** 전체 15개 학습 영역의 canonical Concept에서 공유 Reference 메타데이터 일관성을 검증한다. */
class CanonicalReferenceContractTest {
    private final ClasspathCanonicalContentSource source = new ClasspathCanonicalContentSource();
    private final ContentImportParser parser = new ContentImportParser(new ObjectMapper());
    private final ContentSyncPolicy policy = new ContentSyncPolicy();

    @Test
    void allCanonicalConceptsAcrossAllAreasHaveConsistentSharedReferenceMetadata() {
        List<ImportSourceFile> conceptFiles = source.load().stream()
                .filter(file -> ContentSyncScope.ALL_CONCEPTS.includes(file.path()))
                .map(file -> new ImportSourceFile(file.path(), file.content()))
                .toList();
        assertFalse(conceptFiles.isEmpty());

        List<NormalizedImportItem> items = parser.parse(new ImportFilesCommand(conceptFiles));
        assertFalse(items.isEmpty());
        assertDoesNotThrow(() -> policy.validateSharedReferenceConsistency(items));
    }
}
