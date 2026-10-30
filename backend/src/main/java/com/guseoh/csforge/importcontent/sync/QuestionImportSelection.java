package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import com.guseoh.csforge.importcontent.application.ImportBatchLimits;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 원본 Question 파일에서 명시적으로 선택한 문항만 Import 입력으로 재구성한다. */
@Component
@RequiredArgsConstructor
public class QuestionImportSelection {
    private final ObjectMapper json;

    public ImportFilesCommand select(List<CanonicalContentFile> files, Set<String> keys) {
        return select(files, keys, ContentSyncScope.JAVA_QUESTIONS);
    }

    public ImportFilesCommand select(List<CanonicalContentFile> files, Set<String> keys, ContentSyncScope scope) {
        if (scope != ContentSyncScope.JAVA_QUESTIONS && scope != ContentSyncScope.ALL_QUESTIONS)
            throw new IllegalArgumentException("Question scope required");
        if (keys == null || keys.isEmpty() || keys.size() > ImportBatchLimits.MAX_ITEMS_PER_BATCH
                || keys.stream().anyMatch(key -> key == null || !key.matches("[a-z0-9][a-z0-9._-]{0,159}"))) {
            throw new IllegalArgumentException("Valid explicit Question keys are required");
        }
        List<ImportSourceFile> selectedFiles = new ArrayList<>();
        Set<String> discovered = new HashSet<>();
        Set<String> found = new HashSet<>();
        Set<String> paths = new HashSet<>();
        for (var file : files.stream().sorted(java.util.Comparator.comparing(CanonicalContentFile::path)).toList()) {
            if (!scope.includes(file.path()) || file.path().contains("\\")
                    || java.util.Arrays.stream(file.path().split("/", -1))
                    .anyMatch(part -> part.isEmpty() || part.equals(".") || part.equals(".."))
                    || !paths.add(file.path())) {
                throw new IllegalArgumentException("Unexpected source outside Java Question scope");
            }
            if (file.content().length > ImportBatchLimits.MAX_FILE_BYTES) {
                throw new IllegalArgumentException("Question source file exceeds import bounds");
            }
            JsonNode root = json.readTree(file.content());
            if (!root.isArray()) throw new IllegalArgumentException("Question file must be a JSON array");
            List<JsonNode> selected = new ArrayList<>();
            for (JsonNode item : root) {
                if (!item.isObject() || !item.hasNonNull("contentKey") || !item.get("contentKey").isString()) {
                    throw new IllegalArgumentException("Question identity is invalid");
                }
                String key = item.get("contentKey").asText();
                if (!discovered.add(key)) throw new IllegalArgumentException("Duplicate Question identity");
                if (keys.contains(key)) {
                    selected.add(item);
                    found.add(key);
                }
            }
            if (!selected.isEmpty()) {
                selectedFiles.add(new ImportSourceFile(file.path(), json.writeValueAsBytes(selected)));
            }
        }
        if (!found.equals(keys)) throw new IllegalArgumentException("Selected Question missing from source");
        if (selectedFiles.size() > ImportBatchLimits.MAX_FILES_PER_BATCH) {
            throw new IllegalArgumentException("Too many selected Question files");
        }
        return new ImportFilesCommand(selectedFiles);
    }
}
