package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import javax.tools.ToolProvider;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.ObjectMapper;

/** 게시된 참조 동일성 문항의 실제 코드가 컴파일되고 정답 선택지의 값을 출력하는지 검증한다. */
class LanguageTypesQuestionTest {
    @Test
    void primitiveReferenceQuestionCompilesAndPrintsCorrectChoice(@TempDir Path directory) throws Exception {
        var questions = new ObjectMapper().readTree(Files.readString(Path.of("../content/java/language-types/questions.json")));
        var question = questions.get(0);
        assertEquals("java.core.language-types.primitive-reference-values.q1", question.get("contentKey").asText());
        assertEquals("A", question.get("correctChoiceKey").asText());
        var code = Pattern.compile("```java\\R(.*?)\\R```", Pattern.DOTALL).matcher(question.get("promptMarkdown").asText());
        assertTrue(code.find(), "Question must contain its executable Java example");
        Path source = directory.resolve("ReferenceEqualityQuestion.java");
        Files.writeString(source, "public class ReferenceEqualityQuestion { public static void main(String[] args) {\n" + code.group(1) + "\n} }\n");
        var diagnostics = new ByteArrayOutputStream();
        int compilation = ToolProvider.getSystemJavaCompiler().run(null, null, diagnostics,
                "-proc:none", "-d", directory.toString(), source.toString());
        assertEquals(0, compilation, () -> diagnostics.toString(StandardCharsets.UTF_8));

        String executable = System.getProperty("os.name").startsWith("Windows") ? "java.exe" : "java";
        var process = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", executable).toString(),
                "-cp", directory.toString(), "ReferenceEqualityQuestion").redirectErrorStream(true).start();
        try {
            assertTrue(process.waitFor(10, TimeUnit.SECONDS), "Question example timed out");
            assertEquals(0, process.exitValue());
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).strip();
            assertEquals("true", output);
            assertEquals(question.get("choices").get(0).get("key").asText(), question.get("correctChoiceKey").asText());
            assertEquals(question.get("choices").get(0).get("content").asText(), output);
        } finally {
            process.destroyForcibly();
        }
    }
}
