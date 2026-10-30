package com.guseoh.csforge.importcontent.sync;

import com.guseoh.csforge.importcontent.application.*;
import com.guseoh.csforge.importcontent.domain.ContentSyncCheckpoint;
import com.guseoh.csforge.importcontent.domain.ContentSyncCheckpointRepository;
import com.guseoh.csforge.importcontent.domain.ContentSyncRun;
import com.guseoh.csforge.importcontent.domain.ContentSyncRunRepository;
import com.guseoh.csforge.question.domain.Question;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** Applies canonical Question changes only when the prior database row is unchanged and has no personal history. */
@Service
@RequiredArgsConstructor
public class QuestionContentSyncService {
    private final CanonicalContentSource source;
    private final CanonicalBootstrapBatchPlanner batches;
    private final ContentSyncPlanner planner;
    private final ContentImportAnalyzer analyzer;
    private final QuestionImportSelection selection;
    private final ContentImportApplyService apply;
    private final ContentImportGuard guard;
    private final ContentSyncCheckpointRepository checkpoints;
    private final ContentSyncRunRepository runs;
    private final QuestionPersonalHistory personalHistory;
    private final ObjectMapper json;
    private final Clock clock;

    @Transactional
    public ContentSyncResult synchronize(String sourceSha, String expectedBaseline, String expectedManifest,
            boolean initialize) {
        if (sourceSha == null || !sourceSha.matches("[0-9a-f]{40}"))
            throw new IllegalArgumentException("Full source SHA required");
        guard.acquire();
        var files = questionFiles();
        var sourceManifest = planner.manifest(files);
        String digest = ContentSyncAuditDigest.calculate(files);
        if (!digest.equals(expectedManifest)) throw new IllegalStateException("Source manifest mismatch");

        var checkpoint = checkpoints.findById(ContentSyncScope.ALL_QUESTIONS.name());
        if (initialize && checkpoint.isPresent()) throw new IllegalStateException("Baseline already exists");
        if (!initialize && (checkpoint.isEmpty() || !checkpoint.get().getSourceSha().equals(expectedBaseline)))
            throw new IllegalStateException("Baseline lease mismatch; re-plan from last successful checkpoint");
        var previous = initialize ? new QuestionSyncManifest(Map.of(), Map.of())
                : json.readValue(checkpoint.orElseThrow().getManifest(), QuestionSyncManifest.class);
        planner.changed(new ContentSyncManifest(previous.files()), sourceManifest);

        var protectedKeys = new HashSet<String>();
        var candidatesByBatch = new ArrayList<Set<String>>();
        var sourceKeys = new HashSet<String>();
        var firstPass = new ArrayList<BatchAnalysis>();

        for (var batch : batches.plan(files).batches()) {
            var batchFiles = canonicalFiles(batch.command());
            var analysis = analyzer.analyze(batch.command());
            var evaluations = evaluations(analysis);
            var historyIds = historyIds(analysis, questionIds(analysis));
            var candidateKeys = new HashSet<String>();
            for (var evaluation : evaluations) {
                var item = evaluation.input();
                if (item.kind() != ImportItemKind.QUESTION || item.contentKey() == null
                        || !sourceKeys.add(item.contentKey()))
                    throw new IllegalStateException("Invalid or duplicate canonical Question identity");

                Question question = analysis.state().questions().get(item.contentKey());
                boolean hasHistory = question != null && historyIds.contains(question.getId());
                validateSourceItem(item, evaluation.preview(), hasHistory);
                String sourceDigest = QuestionSyncFingerprint.source(item);
                var old = previous.questions().get(item.contentKey());
                var classification = evaluation.preview().classification();

                if (classification == ImportClassification.UNCHANGED) {
                    if (hasHistory) protectedKeys.add(item.contentKey());
                    continue;
                }
                if (hasHistory) {
                    protectedKeys.add(item.contentKey());
                    continue;
                }
                if (initialize) {
                    candidateKeys.add(item.contentKey());
                    continue;
                }
                if (old == null) {
                    if (classification == ImportClassification.CREATED) candidateKeys.add(item.contentKey());
                    else protectedKeys.add(item.contentKey());
                    continue;
                }
                if (old.protectedFromAutomaticSync()) {
                    protectedKeys.add(item.contentKey());
                    continue;
                }
                if (!sourceDigest.equals(old.sourceDigest())) {
                    String currentDigest = question == null ? null : QuestionSyncFingerprint.database(question);
                    if (Objects.equals(currentDigest, old.databaseDigest())) candidateKeys.add(item.contentKey());
                    else protectedKeys.add(item.contentKey());
                } else {
                    // The source did not change; a DB-only edit is recorded as protected drift.
                    protectedKeys.add(item.contentKey());
                }
            }
            candidatesByBatch.add(Set.copyOf(candidateKeys));
            firstPass.add(new BatchAnalysis(batchFiles, analysis));
        }

        if (!sourceKeys.containsAll(previous.questions().keySet()))
            throw new IllegalStateException("Question identity removal requires explicit reconciliation");

        int updated = 0;
        int created = 0;
        Set<String> changedPaths = new HashSet<>();
        for (int index = 0; index < firstPass.size(); index++) {
            Set<String> keys = candidatesByBatch.get(index);
            if (keys.isEmpty()) continue;
            var command = selection.select(firstPass.get(index).files(), keys, ContentSyncScope.ALL_QUESTIONS);
            var selected = analyzer.analyze(command);
            validateCandidates(selected, keys);
            var result = apply.apply(command, selected.digest());
            var verified = analyzer.analyze(command);
            if (verified.previews().size() != keys.size()
                    || verified.previews().stream().anyMatch(item -> item.classification() != ImportClassification.UNCHANGED))
                throw new IllegalStateException("Selected Question synchronization failed");
            updated += result.updated();
            created += result.created();
            result.items().stream().filter(item -> item.classification() != ImportClassification.UNCHANGED)
                    .map(ImportItemPreview::fileName).forEach(changedPaths::add);
        }

        var targetQuestions = new TreeMap<String, QuestionSyncManifest.QuestionEntry>();
        int unchanged = 0;
        int deferred = 0;
        for (var batch : batches.plan(files).batches()) {
            var analysis = analyzer.analyze(batch.command());
            var evaluations = evaluations(analysis);
            var historyIds = historyIds(analysis, questionIds(analysis));
            for (var evaluation : evaluations) {
                var item = evaluation.input();
                String key = item.contentKey();
                Question question = analysis.state().questions().get(key);
                boolean hasHistory = question != null && historyIds.contains(question.getId());
                validateSourceItem(item, evaluation.preview(), hasHistory);
                var classification = evaluation.preview().classification();
                if (classification == ImportClassification.UNCHANGED) unchanged++;
                else if (!protectedKeys.contains(key))
                    throw new IllegalStateException("Unprotected Question did not reconcile: " + key);
                else deferred++;

                String databaseDigest = question == null ? null : QuestionSyncFingerprint.database(question);
                boolean stillDiffers = classification != ImportClassification.UNCHANGED;
                boolean isProtected = hasHistory || (stillDiffers && protectedKeys.contains(key));
                targetQuestions.put(key, new QuestionSyncManifest.QuestionEntry(
                        QuestionSyncFingerprint.source(item), databaseDigest, isProtected));
            }
        }

        String encoded = json.writeValueAsString(new QuestionSyncManifest(sourceManifest.files(), targetQuestions));
        var target = checkpoint.orElseGet(() -> ContentSyncCheckpoint.establish(
                ContentSyncScope.ALL_QUESTIONS.name(), sourceSha, encoded));
        target.advance(sourceSha, encoded);
        checkpoints.save(target);
        String mode = initialize ? "INITIALIZE" : "APPLY";
        runs.save(ContentSyncRun.completed(ContentSyncScope.ALL_QUESTIONS.name(), sourceSha, digest,
                deferred > 0 ? mode + "_WITH_DEFERRED" : mode, changedPaths.size(), updated, created, Instant.now(clock)));
        return new ContentSyncResult(ContentSyncScope.ALL_QUESTIONS.name(), sourceSha, digest, mode,
                changedPaths.size(), updated, created, unchanged, deferred);
    }

    private List<CanonicalContentFile> questionFiles() {
        var files = source.load().stream().filter(file -> ContentSyncScope.ALL_QUESTIONS.includes(file.path())).toList();
        if (files.isEmpty()) throw new IllegalArgumentException("Question scope is empty");
        return files;
    }

    private static List<CanonicalContentFile> canonicalFiles(ImportFilesCommand command) {
        return command.files().stream().map(file -> new CanonicalContentFile(file.fileName(), file.content())).toList();
    }

    private static List<Evaluation> evaluations(ImportAnalysis analysis) {
        if (analysis.items().size() != analysis.previews().size())
            throw new IllegalStateException("Question analysis count mismatch");
        var values = new ArrayList<Evaluation>();
        for (int index = 0; index < analysis.items().size(); index++)
            values.add(new Evaluation(analysis.items().get(index), analysis.previews().get(index)));
        return values;
    }

    private static List<Long> questionIds(ImportAnalysis analysis) {
        return analysis.state().questions().values().stream().map(Question::getId)
                .filter(Objects::nonNull).distinct().toList();
    }

    private Set<Long> historyIds(ImportAnalysis analysis, Collection<Long> questionIds) {
        var ids = new HashSet<>(analysis.state().questionIdsWithAttempts());
        ids.addAll(personalHistory.findQuestionIds(questionIds));
        return ids;
    }

    private static void validateSourceItem(NormalizedImportItem input, ImportItemPreview preview, boolean hasHistory) {
        if (input.isError() || input.isSkipped() || preview.classification() == ImportClassification.SKIPPED)
            throw new IllegalStateException("Invalid canonical Question requires review: " + input.contentKey());
        if (preview.classification() == ImportClassification.ERROR) {
            boolean historyOnly = hasHistory && !preview.errors().isEmpty() && preview.errors().stream()
                    .allMatch(error -> error.path().equals("question") && error.message().contains("historical Attempts"));
            if (!historyOnly) throw new IllegalStateException("Question validation errors block synchronization: " + input.contentKey());
        }
    }

    private void validateCandidates(ImportAnalysis analysis, Set<String> keys) {
        if (analysis.previews().size() != keys.size() || analysis.hasErrors()
                || analysis.previews().stream().anyMatch(preview -> preview.kind() != ImportItemKind.QUESTION
                || (preview.classification() != ImportClassification.CREATED
                && preview.classification() != ImportClassification.UPDATED)))
            throw new IllegalStateException("Selected canonical Question requires review");
        var historyIds = historyIds(analysis, questionIds(analysis));
        if (!historyIds.isEmpty()) throw new IllegalStateException("Question with personal history cannot be synchronized automatically");
    }

    private record Evaluation(NormalizedImportItem input, ImportItemPreview preview) { }
    private record BatchAnalysis(List<CanonicalContentFile> files, ImportAnalysis analysis) { }
}
