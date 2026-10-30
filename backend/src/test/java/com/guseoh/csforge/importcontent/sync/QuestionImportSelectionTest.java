package com.guseoh.csforge.importcontent.sync;

import static org.junit.jupiter.api.Assertions.*;

import com.guseoh.csforge.importcontent.application.CanonicalContentFile;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

/** 선택된 문항만 원본 파일에서 추출하며 누락·중복 identity를 차단한다. */
class QuestionImportSelectionTest {
    private final ObjectMapper json = new ObjectMapper();
    private final QuestionImportSelection selection = new QuestionImportSelection(json);

    @Test void selectingOneQuestionNeverIncludesNeighbors() {
        var file = file("java/example/questions.json", "[{\"contentKey\":\"java.a\",\"kind\":\"question\"},{\"contentKey\":\"java.b\",\"kind\":\"question\"}]");
        var command = selection.select(List.of(file), Set.of("java.a"));
        var selected = json.readTree(command.files().getFirst().content());
        assertEquals(1, selected.size());
        assertEquals("java.a", selected.get(0).get("contentKey").asText());
        assertEquals("java/example/questions.json", command.files().getFirst().fileName());
    }

    @Test void missingOrDuplicateIdentitiesFailClosed() {
        var first = file("java/example/questions.json", "[{\"contentKey\":\"java.a\"}]");
        var second = file("java/other/questions.json", "[{\"contentKey\":\"java.a\"}]");
        assertThrows(IllegalArgumentException.class, () -> selection.select(List.of(first), Set.of("java.missing")));
        assertThrows(IllegalArgumentException.class, () -> selection.select(List.of(first, second), Set.of("java.a")));
        assertThrows(IllegalArgumentException.class, () -> selection.select(List.of(first), Set.of()));
    }

    @Test void rejectsOtherScopesAndMalformedIdentities() {
        assertThrows(IllegalArgumentException.class, () -> selection.select(
                List.of(file("os/example/questions.json", "[{\"contentKey\":\"java.a\"}]")), Set.of("java.a")));
        assertThrows(IllegalArgumentException.class, () -> selection.select(
                List.of(file("java/example/questions.json", "[{\"contentKey\":3}]")), Set.of("java.a")));
    }

    private CanonicalContentFile file(String path, String value) {
        return new CanonicalContentFile(path, value.getBytes(StandardCharsets.UTF_8));
    }
}
