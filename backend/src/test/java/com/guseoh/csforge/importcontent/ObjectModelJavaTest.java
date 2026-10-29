package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import javax.tools.ToolProvider;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.ObjectMapper;

/** object-model의 실제 본문·문항 코드와 Java 25 생성·호출·복사 계약을 대조한다. */
class ObjectModelJavaTest {
    @TempDir Path directory;
    private int sequence;

    @Test
    void actualConstructorTraceInitializesFieldsAndBlockOnce() throws Exception {
        String trace = blocks("initialization-order-constructor-chaining").stream()
                .filter(b -> b.contains("noarg prologue")).findFirst().orElseThrow();
        assertEquals("noarg prologue\ntarget prologue\nparent\nfield\nblock:unset\ntarget epilogue:kim\nnoarg epilogue", run(trace, null));
        String virtualCall = blocks("initialization-order-constructor-chaining").stream()
                .filter(b -> b.contains("private String name")).findFirst().orElseThrow();
        assertEquals("null\nkim", run(virtualCall + "\nChild child = new Child(); child.print();", null));
    }

    @Test
    void java25EarlyConstructionAllowsWritesButRejectsReadsCallsEscapeAndInvalidDelegation() throws Exception {
        assertTrue(compiles("class P {} class C extends P { int x; C(int n) { if(n<0) throw new IllegalArgumentException(); this.x=n; super(); } }"));
        assertFalse(compiles("class P {} class C extends P { int x; C() { int n=this.x; super(); } }"));
        assertFalse(compiles("class P {} class C extends P { void f() {} C() { f(); super(); } }"));
        assertFalse(compiles("class P {} class C extends P { static void leak(Object x) {} C() { leak(this); super(); } }"));
        assertFalse(compiles("class P {} class C extends P { C() { this(1); super(); } C(int n) {} }"));
        assertFalse(compiles("class C { C() { this(1); } C(int n) { this(); } }"));
        assertFalse(compiles("class P { P(int n) {} } class C extends P {}"));
        assertFalse(compiles("class C { C(String s) {} } class Use { Object c=new C(); }"));
        assertFalse(compiles("class P {} class C extends P { int x=2; C(){ this.x=1; super(); } }"));
        assertFalse(compiles("class P { int x; } class C extends P { C(){ x=1; super(); } }"));
        assertEquals("1\n1", run("class P { P(){ show(); } void show(){} } class C extends P { int x; C(){ this.x=1; super(); } void show(){ System.out.println(x); } } C c=new C(); c.show();", null));
    }

    @Test
    void actualSharedStaticAndDispatchAndOverloadExamplesMatchTheirText() throws Exception {
        var members = blocks("static-vs-instance-members");
        assertEquals("2:kim:lee", run(members.get(0) + members.get(1) + "System.out.println(Member.totalCount + \":\" + a.name + \":\" + b.name);", null));
        assertEquals("dog", run(blocks("polymorphism-dynamic-dispatch").getFirst(), null));
        assertEquals("C-Object\nP-String", run(blocks("overload-vs-override").stream().filter(b -> b.contains("P-Object")).findFirst().orElseThrow() + "\ntarget.call((String) value);", null));
    }

    @Test
    void actualCopyExamplePreservesStructureButSharesElementsAndRejectsMutation() throws Exception {
        String code = blocks("immutability-defensive-copy").stream().filter(b -> b.contains("class MutableMember")).findFirst().orElseThrow();
        assertEquals("park:2:park:1\nUnsupportedOperationException", run(code + "\nSystem.out.println(shared.get(0).name+\":\"+shared.size()+\":\"+copy.get(0).name+\":\"+copy.size()); try { copy.add(new MutableMember(\"x\")); } catch (UnsupportedOperationException e) { System.out.println(e.getClass().getSimpleName()); }", null));
        assertEquals("2:1\n2\n2\nnull rejected", run("List<List<String>> source=new ArrayList<>(); List<String> inner=new ArrayList<>(List.of(\"a\")); source.add(inner); var view=Collections.unmodifiableList(source); var copy=List.copyOf(source); source.add(List.of(\"b\")); System.out.println(view.size()+\":\"+copy.size()); inner.add(\"x\"); System.out.println(copy.get(0).size()); var deep=copy.stream().map(List::copyOf).toList(); inner.add(\"y\"); System.out.println(deep.get(0).size()); try { List.copyOf(Arrays.asList((String)null)); } catch(NullPointerException e) { System.out.println(\"null rejected\"); }", null));
    }

    @Test
    void actualQuestionOutputsAndCompileFailuresAgreeWithCorrectAnswers() throws Exception {
        var questions = new ObjectMapper().readTree(Files.readString(Path.of("../content/java/object-model/questions.json")));
        var executableKeys = List.of("static-vs-instance-members.q4", "static-vs-instance-members.q5", "initialization-order-constructor-chaining.q3", "initialization-order-constructor-chaining.q5", "initialization-order-constructor-chaining.q6", "polymorphism-dynamic-dispatch.q2", "polymorphism-dynamic-dispatch.q6", "overload-vs-override.q3", "reference-casting-instanceof.q4", "reference-casting-instanceof.q5");
        int checked = 0;
        for (var question : questions) {
            String key = question.get("contentKey").asText().replace("java.core.object-model.", "");
            var code = Pattern.compile("```java\\R(.*?)\\R```", Pattern.DOTALL).matcher(question.get("promptMarkdown").asText());
            if (executableKeys.contains(key)) {
                assertTrue(code.find(), key);
                String expected = null;
                for (var choice : question.get("choices")) {
                    if (choice.get("key").asText().equals(question.get("correctChoiceKey").asText())) expected = choice.get("content").asText();
                }
                assertEquals(expected, run(code.group(1), null), key);
                checked++;
            } else if (key.equals("overload-vs-override.q4")) {
                assertEquals("D", question.get("correctChoiceKey").asText());
                assertTrue(code.find());
                String pair = code.group(1);
                assertFalse(compiles("class Check { " + pair + " }"));
                for (String method : pair.lines().toList()) assertTrue(compiles("class Check { " + method + " }"));
            } else if (key.equals("reference-casting-instanceof.q3")) {
                assertTrue(code.find());
                run(code.group(1), "ClassCastException");
            }
        }
        assertEquals(10, checked);
    }

    private List<String> blocks(String slug) throws Exception {
        String text = Files.readString(Path.of("../content/java/object-model/" + slug + ".md"));
        var matcher = Pattern.compile("(?m)^```java\\R(.*?)^```", Pattern.DOTALL).matcher(text);
        List<String> blocks = new ArrayList<>();
        while (matcher.find()) blocks.add(matcher.group(1));
        return blocks;
    }

    private boolean compiles(String source) throws Exception {
        Path file = directory.resolve("Check" + sequence++ + ".java");
        Files.writeString(file, source);
        return ToolProvider.getSystemJavaCompiler().run(null, null, new ByteArrayOutputStream(), "-proc:none", "-d", directory.toString(), file.toString()) == 0;
    }

    private String run(String body, String expectedError) throws Exception {
        String name = "Probe" + sequence++;
        Path file = directory.resolve(name + ".java");
        Files.writeString(file, "import java.util.*; public class " + name + " { public static void main(String[] args) {\n" + body + "\n} }");
        var diagnostics = new ByteArrayOutputStream();
        assertEquals(0, ToolProvider.getSystemJavaCompiler().run(null, null, diagnostics, "-proc:none", "-d", directory.toString(), file.toString()), () -> diagnostics.toString(StandardCharsets.UTF_8));
        String java = System.getProperty("os.name").startsWith("Windows") ? "java.exe" : "java";
        var process = new ProcessBuilder(Path.of(System.getProperty("java.home"), "bin", java).toString(), "-cp", directory.toString(), name).redirectErrorStream(true).start();
        try {
            assertTrue(process.waitFor(15, TimeUnit.SECONDS));
            String result = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8).strip().replace("\r\n", "\n");
            if (expectedError == null) assertEquals(0, process.exitValue(), result);
            else { assertTrue(process.exitValue() != 0); assertTrue(result.contains(expectedError), result); }
            return result;
        } finally { process.destroyForcibly(); }
    }
}
