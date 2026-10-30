package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import java.security.MessageDigest;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 마지막 성공 manifest 이후의 누적 변경을 계산하고 삭제와 identity 교체를 차단한다. */
@Component
@RequiredArgsConstructor
public class ContentSyncPlanner {
    private final ContentImportParser parser;

    public ContentSyncManifest manifest(List<CanonicalContentFile> files) {
        var entries = new TreeMap<String, ContentSyncManifest.Entry>();
        var identities = new HashSet<String>();
        for (var file : files) {
            if (file.path().startsWith("/") || file.path().contains("\\")
                    || Arrays.asList(file.path().split("/", -1)).stream().anyMatch(p -> p.equals("..") || p.equals(".") || p.isEmpty())) {
                throw new IllegalArgumentException("Unsafe canonical path");
            }
            var items = parser.parse(new ImportFilesCommand(List.of(new ImportSourceFile(file.path(), file.content()))));
            var keys = new ArrayList<String>();
            for (var item : items) {
                if (item.isError() || item.isSkipped() || item.kind() == null || item.contentKey() == null)
                    throw new IllegalArgumentException("Invalid canonical identity: " + file.path());
                String key = item.kind() + ":" + item.contentKey();
                if (!identities.add(key)) throw new IllegalArgumentException("Duplicate canonical identity: " + key);
                keys.add(key);
            }
            Collections.sort(keys);
            if (entries.put(file.path(), new ContentSyncManifest.Entry(hash(file.content()), keys)) != null)
                throw new IllegalArgumentException("Duplicate canonical path");
        }
        if (entries.isEmpty()) throw new IllegalArgumentException("Empty sync scope");
        return new ContentSyncManifest(entries);
    }

    public Set<String> changed(ContentSyncManifest previous, ContentSyncManifest target) {
        if (!target.files().keySet().containsAll(previous.files().keySet()))
            throw new IllegalStateException("File removal or move requires explicit reconciliation");
        var changed = new TreeSet<String>();
        target.files().forEach((path, entry) -> {
            var old = previous.files().get(path);
            if (old != null && !entry.identities().containsAll(old.identities()))
                throw new IllegalStateException("Identity removal or replacement: " + path);
            if (!entry.equals(old)) changed.add(path);
        });
        return Set.copyOf(changed);
    }

    private static String hash(byte[] bytes) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
