package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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

/** 실제 canonical 15개 LearningArea의 preview, apply, 동일 재import 계약을 검증한다. */
@Testcontainers
@SpringBootTest
class CanonicalFifteenAreaImportValidationTest {
    private static final List<String> AREA_DIRECTORIES = List.of(
            "computer-architecture",
            "dsa",
            "operating-systems",
            "network-http",
            "database",
            "java",
            "spring",
            "backend-engineering",
            "cache",
            "messaging-async",
            "infrastructure-cloud",
            "performance-observability-operations",
            "distributed-systems",
            "system-design",
            "security");
    private static final int EXPECTED_AREAS = 15;
    private static final int EXPECTED_CONCEPTS = 721;
    private static final int EXPECTED_QUESTIONS = 2449;
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

    private final List<String> reimportMismatches = new ArrayList<>();

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Test
    void canonicalFifteenAreasPreviewApplyAndIdenticalReimportAreDeterministic() throws Exception {
        Path contentRoot = findContentRoot();

        importTopics(contentRoot, false);
        importConcepts(contentRoot, false);
        importQuestions(contentRoot, false);

        assertCanonicalInventory();
        assertRepresentativeContentExists();

        importTopics(contentRoot, true);
        importConcepts(contentRoot, true);
        importQuestions(contentRoot, true);

        assertCanonicalInventory();
        printAreaInventory();
        assertTrue(reimportMismatches.isEmpty(),
                () -> "identical reimport mismatches:" + System.lineSeparator()
                        + String.join(System.lineSeparator(), reimportMismatches));

        int topics = count("topic");
        System.out.printf(
                "CANONICAL_IMPORT_RESULT status=PASS areas=%d topics=%d concepts=%d questions=%d reimport=UNCHANGED%n",
                EXPECTED_AREAS, topics, EXPECTED_CONCEPTS, EXPECTED_QUESTIONS);
    }

    private void importTopics(Path contentRoot, boolean unchangedOnly) throws Exception {
        for (String area : AREA_DIRECTORIES) {
            Path topics = contentRoot.resolve(area).resolve("topics.json");
            assertTrue(Files.isRegularFile(topics), "topics.json missing for " + area);
            applyBatch(List.of(topics), unchangedOnly);
        }
    }

    private void importConcepts(Path contentRoot, boolean unchangedOnly) throws Exception {
        for (String area : AREA_DIRECTORIES) {
            List<Path> concepts;
            try (Stream<Path> paths = Files.walk(contentRoot.resolve(area))) {
                concepts = paths.filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().endsWith(".md"))
                        .sorted(Comparator.comparing(Path::toString))
                        .toList();
            }
            assertTrue(!concepts.isEmpty(), "Concept Markdown missing for " + area);
            for (int start = 0; start < concepts.size(); start += CONCEPT_BATCH_SIZE) {
                int end = Math.min(start + CONCEPT_BATCH_SIZE, concepts.size());
                applyBatch(concepts.subList(start, end), unchangedOnly);
            }
        }
    }

    private void importQuestions(Path contentRoot, boolean unchangedOnly) throws Exception {
        for (String area : AREA_DIRECTORIES) {
            List<Path> questions;
            try (Stream<Path> paths = Files.walk(contentRoot.resolve(area))) {
                questions = paths.filter(Files::isRegularFile)
                        .filter(path -> path.getFileName().toString().equals("questions.json"))
                        .sorted(Comparator.comparing(Path::toString))
                        .toList();
            }
            assertTrue(!questions.isEmpty(), "questions.json missing for " + area);
            applyBatch(questions, unchangedOnly);
        }
    }

    private void applyBatch(List<Path> paths, boolean unchangedOnly) throws Exception {
        ImportFilesCommand command = command(paths);
        ImportPreviewResult preview = previewService.preview(command);
        assertEquals(0, preview.errors(), () -> describeErrors(preview));
        assertTrue(preview.canApply(), () -> describeErrors(preview));

        if (unchangedOnly) {
            List<ImportItemPreview> mismatches = preview.items().stream()
                    .filter(item -> !"UNCHANGED".equals(item.classification().name()))
                    .toList();
            if (!mismatches.isEmpty()) {
                mismatches.forEach(item -> {
                    String diagnostic = describeNonUnchanged(item);
                    reimportMismatches.add(diagnostic);
                    System.out.println(diagnostic);
                });
                return;
            }
        }

        ImportApplyResult applied = applyService.apply(command, preview.previewDigest());
        assertEquals(0, applied.failed());
        if (unchangedOnly) {
            assertEquals(preview.unchanged(), applied.unchanged());
        }
    }

    private static String describeNonUnchanged(ImportItemPreview item) {
        return "CANONICAL_REIMPORT_DIFF file=" + item.fileName()
                + " index=" + item.itemIndex()
                + " kind=" + item.kind()
                + " key=" + item.contentKey()
                + " classification=" + item.classification()
                + " reason=" + item.reason()
                + " diffs=" + item.diffs()
                + " errors=" + item.errors();
    }

    private ImportFilesCommand command(List<Path> paths) throws IOException {
        List<ImportSourceFile> files = new ArrayList<>(paths.size());
        for (Path path : paths) {
            files.add(new ImportSourceFile(path.toString().replace('\\', '/'), Files.readAllBytes(path)));
        }
        return new ImportFilesCommand(files);
    }

    private void assertCanonicalInventory() {
        Integer areasWithTopics = jdbc.queryForObject(
                "select count(distinct learning_area_id) from topic", Integer.class);
        assertEquals(EXPECTED_AREAS, areasWithTopics);
        assertEquals(EXPECTED_CONCEPTS, count("concept"));
        assertEquals(EXPECTED_QUESTIONS, count("question"));
    }

    private void assertRepresentativeContentExists() {
        Integer areasWithConceptBodies = jdbc.queryForObject("""
                select count(distinct a.id)
                from learning_area a
                join topic t on t.learning_area_id = a.id
                join concept c on c.topic_id = t.id
                where length(c.content_markdown) > 100
                """, Integer.class);
        Integer areasWithQuestions = jdbc.queryForObject("""
                select count(distinct a.id)
                from learning_area a
                join topic t on t.learning_area_id = a.id
                join concept c on c.topic_id = t.id
                join question_concept qc on qc.concept_id = c.id
                join question q on q.id = qc.question_id
                where length(q.prompt_markdown) > 10
                """, Integer.class);
        assertEquals(EXPECTED_AREAS, areasWithConceptBodies);
        assertEquals(EXPECTED_AREAS, areasWithQuestions);
    }

    private void printAreaInventory() {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                select a.slug,
                       count(distinct t.id) as topics,
                       count(distinct c.id) as concepts,
                       count(distinct q.id) as questions
                from learning_area a
                join topic t on t.learning_area_id = a.id
                join concept c on c.topic_id = t.id
                join question_concept qc on qc.concept_id = c.id
                join question q on q.id = qc.question_id
                group by a.slug
                order by a.slug
                """);
        for (Map<String, Object> row : rows) {
            System.out.printf(
                    "CANONICAL_IMPORT_AREA area=%s topics=%s concepts=%s questions=%s%n",
                    row.get("slug"), row.get("topics"), row.get("concepts"), row.get("questions"));
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
                .map(CanonicalFifteenAreaImportValidationTest::describeItem)
                .reduce((left, right) -> left + System.lineSeparator() + right)
                .orElse("preview cannot apply without item-level errors");
    }

    private static String describeItem(ImportItemPreview item) {
        return item.fileName() + "#" + item.itemIndex() + " " + item.contentKey() + " " + item.errors();
    }
}
