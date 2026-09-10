package com.guseoh.csforge.importcontent.application;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import com.guseoh.csforge.importcontent.parser.ContentImportParser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** canonical 파일을 Topic, Concept, Question dependency와 import bounds에 맞춰 나눈다. */
@Component
@RequiredArgsConstructor
public class CanonicalBootstrapBatchPlanner {
    private final ContentImportParser parser;

    public CanonicalBootstrapPlan plan(List<CanonicalContentFile> sourceFiles) {
        List<ParsedFile> parsedFiles = sourceFiles.stream().map(this::parse).sorted(Comparator
                .comparingInt((ParsedFile file) -> kindOrder(file.kind()))
                .thenComparing(file -> file.source().path())).toList();
        List<CanonicalBootstrapBatch> batches = new ArrayList<>();
        List<ImportSourceFile> currentFiles = new ArrayList<>();
        ImportItemKind currentKind = null;
        int currentItems = 0;
        long currentBytes = 0;
        for (ParsedFile file : parsedFiles) {
            validateFile(file);
            boolean exceeds = !currentFiles.isEmpty()
                    && (currentFiles.size() == ImportBatchLimits.MAX_FILES_PER_BATCH
                    || currentItems + file.itemCount() > ImportBatchLimits.MAX_ITEMS_PER_BATCH
                    || currentBytes + file.source().content().length > ImportBatchLimits.MAX_TOTAL_BYTES
                    || currentKind != file.kind());
            if (exceeds) {
                batches.add(batch(batches.size() + 1, currentKind, currentFiles, currentItems));
                currentFiles = new ArrayList<>();
                currentKind = null;
                currentItems = 0;
                currentBytes = 0;
            }
            if (currentKind == null) currentKind = file.kind();
            currentFiles.add(new ImportSourceFile(file.source().path(), file.source().content()));
            currentItems += file.itemCount();
            currentBytes += file.source().content().length;
        }
        if (!currentFiles.isEmpty()) batches.add(batch(batches.size() + 1, currentKind, currentFiles, currentItems));
        return new CanonicalBootstrapPlan(batches, sourceFiles.size(), count(parsedFiles, ImportItemKind.TOPIC),
                count(parsedFiles, ImportItemKind.CONCEPT), count(parsedFiles, ImportItemKind.QUESTION),
                parsedFiles.stream().mapToInt(ParsedFile::itemCount).sum());
    }

    private ParsedFile parse(CanonicalContentFile source) {
        List<NormalizedImportItem> items = parser.parse(new ImportFilesCommand(List.of(new ImportSourceFile(source.path(), source.content()))));
        ImportItemKind kind = items.stream().map(NormalizedImportItem::kind).filter(Objects::nonNull).findFirst().orElse(null);
        return new ParsedFile(source, kind, items.size());
    }

    private static void validateFile(ParsedFile file) {
        if (file.source().content().length > ImportBatchLimits.MAX_FILE_BYTES) {
            throw new ImportBoundsException("Canonical file exceeds 2 MiB: " + file.source().path());
        }
        if (file.itemCount() > ImportBatchLimits.MAX_ITEMS_PER_BATCH) {
            throw new ImportBoundsException("Canonical file exceeds 1,000 items: " + file.source().path());
        }
    }

    private static CanonicalBootstrapBatch batch(int sequence, ImportItemKind kind, List<ImportSourceFile> files, int itemCount) {
        return new CanonicalBootstrapBatch(sequence, kind, new ImportFilesCommand(files), itemCount);
    }

    private static int count(List<ParsedFile> files, ImportItemKind kind) {
        return files.stream().filter(file -> file.kind() == kind).mapToInt(ParsedFile::itemCount).sum();
    }

    private static int kindOrder(ImportItemKind kind) {
        return kind == null ? Integer.MAX_VALUE : switch (kind) {
            case TOPIC -> 0;
            case CONCEPT -> 1;
            case QUESTION -> 2;
        };
    }

    private record ParsedFile(CanonicalContentFile source, ImportItemKind kind, int itemCount) {
    }
}
