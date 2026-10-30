package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class ContentSyncScopeTest {
    @Test void allScopesCoverOtherAreasWithoutMixingContentTypes() {
        assertTrue(ContentSyncScope.ALL_TOPICS.includes("spring/topics.json"));
        assertTrue(ContentSyncScope.ALL_CONCEPTS.includes("database/transactions/isolation.md"));
        assertTrue(ContentSyncScope.ALL_QUESTIONS.includes("network-http/dns/questions.json"));
        assertFalse(ContentSyncScope.JAVA_CONCEPTS.includes("spring/core/a.md"));
        assertFalse(ContentSyncScope.ALL_TOPICS.includes("spring/core/questions.json"));
        assertFalse(ContentSyncScope.ALL_CONCEPTS.includes("java/topics.json"));
        assertFalse(ContentSyncScope.ALL_QUESTIONS.includes("../java/questions.json"));
        assertFalse(ContentSyncScope.ALL_CONCEPTS.includes("spring/../secret.md"));
        assertFalse(ContentSyncScope.ALL_TOPICS.includes("spring\\topics.json"));
    }
}
