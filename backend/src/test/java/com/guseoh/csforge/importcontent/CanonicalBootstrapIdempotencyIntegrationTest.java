package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatch;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapExecutionResult;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportClassification;
import com.guseoh.csforge.importcontent.application.ImportFieldDiff;
import com.guseoh.csforge.importcontent.application.ImportItemPreview;
import com.guseoh.csforge.importcontent.application.ImportPreviewResult;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 전체 canonical pack을 apply한 뒤 모든 항목이 UNCHANGED로 재분류되는지 검증한다. */
@Testcontainers
@SpringBootTest
class CanonicalBootstrapIdempotencyIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_bootstrap_idempotency_test");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalContentSource contentSource;
    @Autowired CanonicalBootstrapBatchPlanner batchPlanner;
    @Autowired ContentImportPreviewService previewService;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @TestFactory
    Stream<DynamicTest> canonicalBootstrapIsFullyIdempotent() {
        CanonicalBootstrapExecutionResult first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "initial canonical bootstrap failed: " + first);

        List<ImportItemPreview> differences = new ArrayList<>();
        for (CanonicalBootstrapBatch batch : batchPlanner.plan(contentSource.load()).batches()) {
            ImportPreviewResult preview = previewService.preview(batch.command());
            preview.items().stream()
                    .filter(item -> item.classification() != ImportClassification.UNCHANGED)
                    .forEach(differences::add);
        }

        if (differences.isEmpty()) {
            return Stream.of(DynamicTest.dynamicTest("all canonical items are unchanged after bootstrap", () -> assertTrue(true)));
        }

        return differences.stream().map(item -> DynamicTest.dynamicTest(displayName(item),
                () -> assertEquals(ImportClassification.UNCHANGED, item.classification())));
    }

    private static String displayName(ImportItemPreview item) {
        String detail = item.diffs().stream()
                .findFirst()
                .map(CanonicalBootstrapIdempotencyIntegrationTest::formatDiff)
                .orElseGet(() -> item.errors().isEmpty() ? String.valueOf(item.reason()) : item.errors().getFirst().toString());
        return item.kind() + " " + item.contentKey() + " -> " + item.classification() + " | " + compact(detail);
    }

    private static String formatDiff(ImportFieldDiff diff) {
        return diff.field() + ": " + diff.before() + " -> " + diff.after();
    }

    private static String compact(String value) {
        if (value == null) return "no detail";
        String oneLine = value.replace('\n', ' ').replace('\r', ' ');
        return oneLine.length() <= 240 ? oneLine : oneLine.substring(0, 240) + "…";
    }
}
