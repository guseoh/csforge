package com.guseoh.csforge.importcontent;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.ByteBuffer;
import java.nio.channels.Pipe;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.tools.ToolProvider;
import java.util.*;
import org.junit.jupiter.api.Test;

class JavaApiContractTest {
    @org.junit.jupiter.api.io.TempDir
    Path compilation;

    @Test
    void genericTypeBoundariesAreActuallyCheckedByJavaCompiler() throws Exception {
        assertTrue(compiles("import java.util.*; class Probe { static <T> void copy(List<? extends T> src, List<? super T> dst) { for(T value:src) dst.add(value); } void run() { copy(List.of(1), new ArrayList<Number>()); } }"));
        assertFalse(compiles("import java.util.*; class Probe { List<String> names = new ArrayList<>(); List<Object> alias = names; }"));
        assertFalse(compiles("import java.util.*; class Probe { boolean test(Object value) { return value instanceof List<String>; } }"));
        assertFalse(compiles("import java.util.*; class Probe { void process(List<String> x) {} void process(List<Integer> x) {} }"));
    }

    private boolean compiles(String source) throws Exception {
        Path file = compilation.resolve("Probe.java");
        Files.writeString(file, source);
        try (var diagnostics = new java.io.ByteArrayOutputStream()) {
            return ToolProvider.getSystemJavaCompiler().run(null, diagnostics, diagnostics, "--release", "25", "-d", compilation.toString(), file.toString()) == 0;
        }
    }

    @Test
    void bufferPreservesBytesAcrossCompactAndClear() {
        ByteBuffer b = ByteBuffer.allocate(8);
        b.put(new byte[]{65, 66, 67, 68, 69});
        assertEquals(5, b.position());
        b.flip();
        assertEquals(5, b.limit());
        b.get(new byte[3]);
        b.compact();
        assertEquals(2, b.position());
        assertEquals(8, b.limit());
        assertEquals(68, b.get(0));
        assertEquals(69, b.get(1));
        b.clear();
        assertEquals(0, b.position());
        assertEquals(68, b.get(0));
    }

    @Test
    void selectedKeysSurviveReadAndZeroUpdateUntilExplicitRemoval() throws Exception {
        Pipe pipe = Pipe.open();
        try (var source = pipe.source(); var sink = pipe.sink(); Selector selector = Selector.open()) {
            source.configureBlocking(false);
            SelectionKey key = source.register(selector, SelectionKey.OP_READ);
            sink.write(ByteBuffer.wrap(new byte[]{1}));
            assertEquals(1, selector.select(2000));
            assertEquals(SelectionKey.OP_READ, key.readyOps());
            assertEquals(1, source.read(ByteBuffer.allocate(8)));
            assertEquals(0, selector.selectNow());
            assertTrue(selector.selectedKeys().contains(key));
            assertEquals(SelectionKey.OP_READ, key.readyOps());
            var iterator = selector.selectedKeys().iterator();
            assertSame(key, iterator.next());
            iterator.remove();
            assertTrue(selector.selectedKeys().isEmpty());
            assertTrue(selector.keys().contains(key));
            assertTrue(key.isValid());
            key.cancel();
            assertFalse(key.isValid());
            selector.selectNow();
            assertTrue(selector.keys().isEmpty());
        }
    }

    @Test
    void collisionsViewsComparatorAndGenericVarargsFollowExamples() {
        assertEquals("Aa".hashCode(), "BB".hashCode());
        var map = new HashMap<>(Map.of("Aa", 1, "BB", 2));
        assertEquals(2, map.get("BB"));
        map.keySet().remove("Aa");
        assertFalse(map.containsKey("Aa"));
        var source = new ArrayList<>(List.of("A"));
        var view = Collections.unmodifiableList(source);
        var copy = List.copyOf(source);
        source.add("B");
        assertEquals(List.of("A", "B"), view);
        assertEquals(List.of("A"), copy);
        assertThrows(UnsupportedOperationException.class, () -> view.add("C"));
        record Task(int priority, int id) {}
        var order = Comparator.comparingInt(Task::priority).reversed().thenComparingInt(Task::id);
        assertTrue(order.compare(new Task(5, 1), new Task(5, 2)) < 0);
        assertThrows(ClassCastException.class, () -> unsafe(List.of("java")));
    }

    @SuppressWarnings({"unchecked", "varargs"})
    private static void unsafe(List<String>... lists) {
        Object[] array = lists;
        array[0] = List.of(42);
        String value = lists[0].getFirst();
        fail(value);
    }
}
