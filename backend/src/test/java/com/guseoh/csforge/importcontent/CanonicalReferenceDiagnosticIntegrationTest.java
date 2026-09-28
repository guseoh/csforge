package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatch;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapService;
import com.guseoh.csforge.importcontent.application.CanonicalContentSource;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.test.PostgresIntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest
class CanonicalReferenceDiagnosticIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = PostgresIntegrationTestSupport.container("csforge_reference_diagnostic_test");

    @Autowired CanonicalBootstrapService bootstrapService;
    @Autowired CanonicalContentSource contentSource;
    @Autowired CanonicalBootstrapBatchPlanner batchPlanner;
    @Autowired ContentImportPreviewService previewService;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        PostgresIntegrationTestSupport.registerDataSourceProperties(registry, POSTGRES);
    }

    @Test
    void printsDataShapeReferenceDiff() {
        var first = bootstrapService.bootstrap();
        assertTrue(first.success(), () -> "initial bootstrap failed: " + first);

        for (CanonicalBootstrapBatch batch : batchPlanner.plan(contentSource.load()).batches()) {
            var preview = previewService.preview(batch.command());
            preview.items().stream()
                    .filter(item -> item.contentKey().equals("dsa.core.algorithm-selection.data-shape"))
                    .forEach(item -> {
                        System.out.println("DATA_SHAPE_CLASSIFICATION=" + item.classification());
                        item.diffs().forEach(diff -> {
                            System.out.println("DATA_SHAPE_DIFF_FIELD=" + diff.field());
                            System.out.println("DATA_SHAPE_DIFF_BEFORE=" + diff.before());
                            System.out.println("DATA_SHAPE_DIFF_AFTER=" + diff.after());
                        });
                    });
        }
    }
}
