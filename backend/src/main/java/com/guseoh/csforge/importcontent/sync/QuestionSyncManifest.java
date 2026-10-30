package com.guseoh.csforge.importcontent.sync;

import java.util.Map;

/** Full-scope Question checkpoint with per-key source and database fingerprints. */
public record QuestionSyncManifest(Map<String, ContentSyncManifest.Entry> files,
        Map<String, QuestionEntry> questions) {
    public QuestionSyncManifest {
        files = Map.copyOf(files);
        questions = Map.copyOf(questions);
    }

    public record QuestionEntry(String sourceDigest, String databaseDigest, boolean protectedFromAutomaticSync) { }
}
