package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;
import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import java.util.*;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class ContentSyncPlannerTest {
    private final ContentSyncPlanner planner = new ContentSyncPlanner(new ContentImportParser(new ObjectMapper()));

    @Test void retryIncludesAllChangesSinceLastSuccessfulManifest() {
        var old = manifest(Map.of("java/a.md", "1", "java/b.md", "1"));
        var target = manifest(Map.of("java/a.md", "2", "java/b.md", "3"));
        assertEquals(Set.of("java/a.md", "java/b.md"), planner.changed(old, target));
        assertEquals(Set.of(), planner.changed(target, target));
    }

    @Test void removalAndIdentityReplacementBlock() {
        var old = manifest(Map.of("java/a.md", "1"));
        assertThrows(IllegalStateException.class, () -> planner.changed(old, manifest(Map.of())));
        var replaced = new ContentSyncManifest(Map.of("java/a.md", new ContentSyncManifest.Entry("2", List.of("CONCEPT:other"))));
        assertThrows(IllegalStateException.class, () -> planner.changed(old, replaced));
    }

    @Test void duplicateIdentityAndTraversalBlock() {
        String md = "---\nkind: concept\ncontentKey: java.test\ntopicContentKey: java.topic\nslug: test\ntitle: Test\nlevel: 1\nstatus: PUBLISHED\n---\nBody";
        var a = new CanonicalContentFile("java/a.md", md.getBytes(StandardCharsets.UTF_8));
        assertEquals(1, planner.manifest(List.of(a)).files().size());
        assertThrows(IllegalArgumentException.class, () -> planner.manifest(List.of(a, new CanonicalContentFile("java/b.md", a.content()))));
        assertThrows(IllegalArgumentException.class, () -> planner.manifest(List.of(new CanonicalContentFile("java/../a.md", a.content()))));
    }

    private ContentSyncManifest manifest(Map<String, String> files) {
        var entries = new HashMap<String, ContentSyncManifest.Entry>();
        files.forEach((k, v) -> entries.put(k, new ContentSyncManifest.Entry(v, List.of("CONCEPT:" + k))));
        return new ContentSyncManifest(entries);
    }
}
