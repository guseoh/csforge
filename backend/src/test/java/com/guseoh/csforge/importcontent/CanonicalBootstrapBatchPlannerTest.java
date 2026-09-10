package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;

import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatch;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapBatchPlanner;
import com.guseoh.csforge.importcontent.application.CanonicalBootstrapPlan;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.ImportBatchLimits;
import com.guseoh.csforge.importcontent.application.ImportItemKind;
import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

/** canonical source discovery와 dependency-aware batch bounds를 검증한다. */
class CanonicalBootstrapBatchPlannerTest {
    private final ClasspathSourceFixture source = new ClasspathSourceFixture();
    private final CanonicalBootstrapBatchPlanner planner = new CanonicalBootstrapBatchPlanner(new ContentImportParser(new ObjectMapper()));

    @Test
    void canonicalPackIsStableAndDependencyOrdered() {
        CanonicalBootstrapPlan plan = planner.plan(source.files());

        assertEquals(870, plan.sourceFileCount());
        assertEquals(134, plan.topicCount());
        assertEquals(721, plan.conceptCount());
        assertEquals(2_449, plan.questionCount());
        assertEquals(3_304, plan.totalItemCount());
        assertFalse(plan.batches().isEmpty());
        assertEquals(List.of(ImportItemKind.TOPIC, ImportItemKind.CONCEPT, ImportItemKind.QUESTION),
                plan.batches().stream().map(CanonicalBootstrapBatch::kind).distinct().toList());

        int expectedSequence = 1;
        for (CanonicalBootstrapBatch batch : plan.batches()) {
            assertEquals(expectedSequence++, batch.sequence());
            assertTrue(batch.command().files().size() <= ImportBatchLimits.MAX_FILES_PER_BATCH);
            assertTrue(batch.itemCount() <= ImportBatchLimits.MAX_ITEMS_PER_BATCH);
            assertTrue(batch.command().files().stream().mapToLong(file -> file.content().length).sum() <= ImportBatchLimits.MAX_TOTAL_BYTES);
            assertTrue(batch.command().files().stream().allMatch(file -> file.fileName().endsWith(".md")
                    || file.fileName().endsWith("topics.json") || file.fileName().endsWith("questions.json")));
        }
    }

    @Test
    void plannerSplitsWhenItemBoundIsReachedBeforeFileBound() {
        List<CanonicalContentFile> files = new ArrayList<>();
        for (int fileIndex = 0; fileIndex < 100; fileIndex++) {
            StringBuilder json = new StringBuilder("[");
            for (int itemIndex = 0; itemIndex < 11; itemIndex++) {
                if (itemIndex > 0) json.append(',');
                json.append("{\"kind\":\"topic\",\"contentKey\":\"bound.")
                        .append(fileIndex).append('.').append(itemIndex)
                        .append("\",\"areaSlug\":\"java\",\"slug\":\"bound-")
                        .append(fileIndex).append('-').append(itemIndex).append("\",\"title\":\"Bound\"}");
            }
            json.append(']');
            files.add(new CanonicalContentFile(String.format("java/topics-%03d.json", fileIndex), json.toString().getBytes()));
        }

        CanonicalBootstrapPlan plan = planner.plan(files);

        assertEquals(2, plan.batches().size());
        assertEquals(990, plan.batches().get(0).itemCount());
        assertEquals(110, plan.batches().get(1).itemCount());
        assertTrue(plan.batches().stream().allMatch(batch -> batch.itemCount() <= ImportBatchLimits.MAX_ITEMS_PER_BATCH));
    }

    private static final class ClasspathSourceFixture {
        private List<CanonicalContentFile> files() {
            com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource source =
                    new com.guseoh.csforge.importcontent.infrastructure.ClasspathCanonicalContentSource();
            List<CanonicalContentFile> files = source.load();
            assertNotNull(files);
            return files;
        }
    }
}
