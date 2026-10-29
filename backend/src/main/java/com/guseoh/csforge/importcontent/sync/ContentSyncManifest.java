package com.guseoh.csforge.importcontent.sync;

import java.util.Map;
import java.util.List;

/** 파일 byte hash와 안정된 항목 키를 함께 고정한 동기화 입력이다. */
public record ContentSyncManifest(Map<String, Entry> files) {
    public ContentSyncManifest { files = Map.copyOf(files); }
    public record Entry(String hash, List<String> identities) {
        public Entry { identities = List.copyOf(identities); }
    }
}
