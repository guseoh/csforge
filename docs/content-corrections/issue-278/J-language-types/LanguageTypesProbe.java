import java.io.StringWriter;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import javax.tools.SimpleJavaFileObject;
import javax.tools.ToolProvider;

/** 첫 language-types Pack의 언어·API 결과와 컴파일 경계를 Java 25로 대조한다. */
class LanguageTypesProbe {
    static class Member { String name; }

    public static void main(String[] args) throws Exception {
        int a = 10;
        int b = a;
        b = 20;
        check(a == 10 && b == 20, "primitive copy");
        Member first = new Member();
        check(first.name == null, "default field");
        first.name = "kim";
        Member second = first;
        second.name = "lee";
        second = new Member();
        second.name = "park";
        check(first.name.equals("lee") && second.name.equals("park"), "shared mutation vs reassignment");

        compile("class Check { void f(boolean ok) { int x; if(ok) x=1; else x=0; System.out.println(x); } }", true);
        compile("class Check { void f(boolean ok) { int x; if(ok) x=1; else throw new IllegalStateException(); System.out.println(x); } }", true);
        compile("class Check { void f(boolean ok) { int x; if(ok) x=1; System.out.println(x); } }", false);
        compile("class Check { void f(boolean ok) { int x; if(ok) x=1; if(!ok) x=0; System.out.println(x); } }", false);
        compile("class Check { void f() { for(int i=0;i<1;i++) {} System.out.println(i); } }", false);
        compile("class Check { void f(boolean ok) { final int x; if(ok) x=1; else x=0; System.out.println(x); } }", true);

        long total = 3_000_000_000L;
        check((int) total == -1_294_967_296, "narrowing");
        expect(ArithmeticException.class, () -> Math.toIntExact(total));
        int big = 2_000_000_000;
        check((long) (big + big) == -294_967_296L && (long) big + big == 4_000_000_000L, "promotion before arithmetic");
        check(Double.toString(0.1 + 0.2).equals("0.30000000000000004"), "floating output");
        int precise = 1_234_567_890;
        check((long) (float) precise != precise, "widening can lose precision");
        compile("class Check { byte f() { byte a=1,b=2; return a+b; } }", false);
        compile("class Check { byte f() { final byte a=1,b=2; return a+b; } }", true);

        Integer boxedA = 100, boxedB = 100;
        check(boxedA == boxedB, "constant boxing identity");
        Integer missing = null;
        check(missing == null, "null comparison without unboxing");
        expect(NullPointerException.class, () -> { int ignored = missing; });
        var counts = new HashMap<String, Integer>();
        counts.put("present-null", null);
        check(counts.getOrDefault("absent", 0) == 0 && counts.getOrDefault("present-null", 0) == null, "map null vs absent");

        Member caller = new Member();
        caller.name = "kim";
        replace(caller);
        check(caller.name.equals("kim"), "pass by value");
        String[] names = new String[2];
        Object[] values = names;
        values[0] = "kim";
        expect(ArrayStoreException.class, () -> values[1] = Integer.valueOf(1));
        check(names[0].equals("kim") && names[1] == null && names.length == 2, "failed store preserves previous writes");
        values[1] = null;

        final List<String> list = new ArrayList<>();
        list.add("kim");
        List<String> snapshot = List.copyOf(list);
        list.add("lee");
        check(snapshot.equals(List.of("kim")), "copyOf separates list structure");
        expect(UnsupportedOperationException.class, () -> snapshot.add("park"));
        compile("class Check { void f() { final Object x=new Object(); x=new Object(); } }", false);
        String string = "kim";
        string.toUpperCase(Locale.ROOT);
        check(string.equals("kim") && string.toUpperCase(Locale.ROOT).equals("KIM"), "String immutability");
        String literal = "java";
        String created = new String("java");
        String pooled = created.intern();
        check(literal == pooled && literal != created && literal.equals(created), "intern returns reference");
        String part = "ja";
        String combined = part + "va";
        final String constant = "ja";
        check(combined != literal && (constant + "va") == literal, "constant vs nonconstant concatenation");
        var builder = new StringBuilder("a");
        String text = builder.toString();
        builder.append("b");
        check(text.equals("a") && builder.toString().equals("ab"), "builder vs immutable result");
        System.out.println("PASS: 10 Concept runtime boundaries; 9 compiler acceptance/rejection cases (Java " + Runtime.version() + ")");
    }

    private static void replace(Member value) { value = new Member(); value.name = "park"; }

    private static void check(boolean ok, String name) {
        if (!ok) throw new AssertionError(name);
    }

    private static void expect(Class<? extends RuntimeException> type, Runnable action) {
        try { action.run(); } catch (RuntimeException failure) {
            if (type.isInstance(failure)) return;
            throw failure;
        }
        throw new AssertionError("Expected " + type.getSimpleName());
    }

    private static void compile(String source, boolean expected) throws Exception {
        Path output = Files.createTempDirectory("csforge-language-types-probe-");
        try {
            var file = new SimpleJavaFileObject(URI.create("string:///Check.java"), javax.tools.JavaFileObject.Kind.SOURCE) {
                @Override public CharSequence getCharContent(boolean ignoreEncodingErrors) { return source; }
            };
            try (var manager = ToolProvider.getSystemJavaCompiler().getStandardFileManager(null, null, null)) {
                boolean actual = ToolProvider.getSystemJavaCompiler().getTask(new StringWriter(), manager, null,
                        List.of("-proc:none", "-d", output.toString()), null, List.of(file)).call();
                check(actual == expected, "compile: " + source);
            }
        } finally {
            try (var paths = Files.walk(output)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.delete(path);
            }
        }
    }
}
