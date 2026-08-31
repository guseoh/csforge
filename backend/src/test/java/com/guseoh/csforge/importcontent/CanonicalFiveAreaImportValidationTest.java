package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import com.guseoh.csforge.importcontent.application.ContentImportApplyService;
import com.guseoh.csforge.importcontent.application.ContentImportPreviewService;
import com.guseoh.csforge.importcontent.application.ImportApplyResult;
import com.guseoh.csforge.importcontent.application.ImportFilesCommand;
import com.guseoh.csforge.importcontent.application.ImportItemPreview;
import com.guseoh.csforge.importcontent.application.ImportPreviewResult;
import com.guseoh.csforge.importcontent.application.ImportSourceFile;

/** 실제 canonical 5개 LearningArea의 preview, apply, 동일 재import 계약을 검증한다. */
@Testcontainers
@SpringBootTest
class CanonicalFiveAreaImportValidationTest {
    private static final List<String> AREAS = List.of(
            "java",
            "spring",
            "database",
            "security",
            "backend-engineering");
    private static final int CONCEPT_BATCH_SIZE = 60;

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16.4")
            .withDatabaseName("csforge_canonical_content")
            .withUsername("csforge")
            .withPassword("csforge");

    @Autowired
    ContentImportPreviewService previewService;

    @Autowired
    ContentImportApplyService applyService;

    @Autowired
    JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Test
    void canonicalFiveAreasPreviewApplyAndIdenticalReimportAreDeterministic() throws Exception {
        Path contentRoot = findContentRoot();

        importTopics(contentRoot, false);
        importConcepts(contentRoot, false);
        importQuestions(contentRoot, false);

        assertEquals(67, count("topic"));
        assertEquals(295, count("concept"));
        assertEquals(1031, count("question"));
        assertRepresentativeContentExists();

        importTopics(contentRoot, true);
        importConcepts(contentRoot, true);
        importQuestions(contentRoot, true);

        assertEquals(67, count("topic"));
        assertEquals(295, count("concept"));
        assertEquals(1031, count("question"));

        for (String area : AREAS) {
            int topicCount = jdbc.queryForObject("""
                    select count(*)
                    from topic t
                    join learning_area a on a.id = t.learning_area_id
                    where a.slug = ?
                    """, Integer.class, area);
            int conceptCount = jdbc.queryForObject("""
                    select count(*)
                    from concept c
                    join topic t on t.id = c.topic_id
                    join learning_area a on a.id = t.learning_area_id
                    where a.slug = ?
                    """, Integer.class, area);
            int questionCount = jdbc.queryForObject("""
                    select count(distinct q.id)
                    from question q
                    join question_concept qc on qc.question_id = q.id
                    join concept c on c.id = qc.concept_id
                    join topic t on t.id = c.topic_id
                    join learning_area a on a.id = t.learning_area_id
                    where a.slug = ?
                    """, Integer.class, area);
            System.out.printf("CANONICAL_IMPORT_AREA area=%s topics=%d concepts=%d questions=%d%n",
                    area, topicCount, conceptCount, questionCount);
        }

        System.out.println("CANONICAL_IMPORT_RESULT status=PASS topics=67 concepts=295 questions=1031 reimport=UNCHANGED");
    }

    private void importTopics(Path contentRoot, boolean unchangedOnly) throws Exception {
        for (String area : AREAS) {
            applyBatch(List.of(contentRoot.resolve(area).resolve("topics.json")), unchangedOnly);
        }
    }

    private void importConcepts(Path contentRoot, boolean unchangedOnly) throws Exception {
        for (String area : AREAS) {
            List<Path> concepts;
            try (Stream<Path> paths = Files.walk(contentRoot.resolve(area))) {
                concepts = paths.filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().endsWith(".md"))
                        .sorted(Comparator.comparing(Path::toString))
                        .toList();
            }
            for (int start = 0; start < concepts.size(); start += CONCEPT_BATCH_SIZE) {
                int end = Math.min(start + CONCEPT_BATCH_SIZE, concepts.size());
                applyBatch(concepts.subList(start, end), unchangedOnly);
            }
        }
    }

    private void importQuestions(Path contentRoot, boolean unchangedOnly) throws Exception {
        for (String area : AREAS) {
            List<Path> questions;
            try (Stream<Path> paths = Files.walk(contentRoot.resolve(area))) {
                questions = paths.filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().equals("questions.json"))
                        .sorted(Comparator.comparing(Path::toString))
                        .toList();
            }
            applyBatch(questions, unchangedOnly);
        }
    }

    private void applyBatch(List<Path> paths, boolean unchangedOnly) throws Exception {
        if (paths.isEmpty()) {
            return;
        }
        ImportFilesCommand command = command(paths);
        ImportPreviewResult preview = previewService.preview(command);
        assertEquals(0, preview.errors(), () -> describeErrors(preview));
        assertTrue(preview.canApply(), () -> describeErrors(preview));

        if (unchangedOnly) {
            assertEquals(0, preview.created(), "identical reimport must not create canonical items");
            assertEquals(0, preview.updated(), "identical reimport must not update canonical items");
            assertEquals(0, preview.skipped(), "canonical files must not be skipped");
            assertEquals(preview.items().size(), preview.unchanged(),
                    "every canonical item must classify as UNCHANGED on identical reimport");
        }

        ImportApplyResult applied = applyService.apply(command, preview.previewDigest());
        assertEquals(0, applied.failed());
        if (unchangedOnly) {
            assertEquals(preview.unchanged(), applied.unchanged());
        }
    }

    private ImportFilesCommand command(List<Path> paths) throws IOException {
        List<ImportSourceFile> files = new ArrayList<>(paths.size());
        for (Path path : paths) {
            files.add(new ImportSourceFile(path.toString().replace('\\', '/'), Files.readAllBytes(path)));
        }
        return new ImportFilesCommand(files);
    }

    private void assertRepresentativeContentExists() {
        for (String area : AREAS) {
            Integer concepts = jdbc.queryForObject("""
                    select count(*)
                    from concept c
                    join topic t on t.id = c.topic_id
                    join learning_area a on a.id = t.learning_area_id
                    where a.slug = ? and length(c.content_markdown) > 100
                    """, Integer.class, area);
            Integer questions = jdbc.queryForObject("""
                    select count(distinct q.id)
                    from question q
                    join question_concept qc on qc.question_id = q.id
                    join concept c on c.id = qc.concept_id
                    join topic t on t.id = c.topic_id
                    join learning_area a on a.id = t.learning_area_id
                    where a.slug = ? and length(q.prompt_markdown) > 10
                    """, Integer.class, area);
            assertTrue(concepts != null && concepts > 0, "representative Concept missing for " + area);
            assertTrue(questions != null && questions > 0, "representative Question missing for " + area);
        }
    }

    private int count(String table) {
        return jdbc.queryForObject("select count(*) from " + table, Integer.class);
    }

    private static Path findContentRoot() {
        Path cwd = Path.of("").toAbsolutePath().normalize();
        Path direct = cwd.resolve("content");
        if (Files.isDirectory(direct)) {
            return direct;
        }
        Path parent = cwd.resolve("..").resolve("content").normalize();
        if (Files.isDirectory(parent)) {
            return parent;
        }
        throw new IllegalStateException("content directory not found from " + cwd);
    }

    private static String describeErrors(ImportPreviewResult preview) {
        return preview.items().stream()
                .filter(item -> !item.errors().isEmpty())
                .map(CanonicalFiveAreaImportValidationTest::describeItem)
                .reduce((left, right) -> left + System.lineSeparator() + right)
                .orElse("preview cannot apply without item-level errors");
    }

    private static String describeItem(ImportItemPreview item) {
        return item.fileName() + "#" + item.itemIndex() + " " + item.contentKey() + " " + item.errors();
    }
}
