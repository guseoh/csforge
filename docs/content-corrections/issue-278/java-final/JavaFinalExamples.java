import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.time.*;
import java.time.zone.ZoneRulesProvider;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import javax.tools.ToolProvider;

/** 최종 Java 도식과 대조할 실제 API·바이트코드 관측값을 출력한다. */
public class JavaFinalExamples {
    private static final Map<String, String> observations = new LinkedHashMap<>();
    private static String initialization = "";
    private static class Parent {
        static int value = initialize();
        static int initialize() { initialization += "P"; return 7; }
    }
    private static class Child extends Parent { static { initialization += "C"; } }
    private static class Constants {
        static final int PORT = 8080;
        static { initialization += "K"; }
    }
    private record Money(int amount) {
        Money add(int price) { return new Money(amount + price); }
    }
    private record Resource(String name) implements AutoCloseable {
        @Override public void close() { throw new IllegalStateException(name); }
    }

    public static void main(String[] args) throws Exception {
        exceptionsAndValues();
        datesAndZones();
        concurrency();
        initializationAndBytecode();
        observations.forEach((key, value) -> System.out.println(key + "=" + value));
    }

    private static void observe(String key, Object value) {
        observations.put(key, String.valueOf(value));
    }

    private static void exceptionsAndValues() {
        try (var first = new Resource("first"); var second = new Resource("second")) {
            throw new IllegalArgumentException("work");
        } catch (Exception failure) {
            observe("resource.primary", failure.getMessage());
            observe("resource.suppressed", String.join(",", Arrays.stream(failure.getSuppressed()).map(Throwable::getMessage).toList()));
        }
        int source = 100;
        int target = 50;
        try {
            source -= 30;
            throw new IllegalStateException("target failed");
        } catch (IllegalStateException expected) {
            observe("partial.source", source);
            observe("partial.target", target);
        }
        Money current = new Money(100);
        Money next = current.add(30);
        try {
            if (next.amount() > 120) throw new IllegalStateException("limit");
            current = next;
        } catch (IllegalStateException expected) {
            observe("money.failed", current.amount());
        }
        current = next;
        observe("money.success", current.amount());
        observe("optional.mapNull", Optional.of("value").map(value -> null).isEmpty());
        var ordered = new ArrayList<Integer>();
        java.util.stream.IntStream.range(0, 1000).parallel().forEachOrdered(ordered::add);
        observe("stream.ordered", ordered.equals(java.util.stream.IntStream.range(0, 1000).boxed().toList()));
        var partition = java.util.stream.Stream.<Integer>empty().collect(java.util.stream.Collectors.partitioningBy(value -> value > 0));
        observe("partition.keys", partition.keySet().size());
    }

    private static void datesAndZones() {
        var paris = ZoneId.of("Europe/Paris");
        var gap = LocalDateTime.of(2026, 3, 29, 2, 30);
        observe("tzdb", ZoneRulesProvider.getVersions("Europe/Paris").lastKey());
        observe("gap.offsets", paris.getRules().getValidOffsets(gap).size());
        observe("gap.adjusted", gap.atZone(paris).toOffsetDateTime());
        var overlap = LocalDateTime.of(2026, 10, 25, 2, 30);
        observe("overlap.offsets", paris.getRules().getValidOffsets(overlap).size());
        observe("overlap.earlier", overlap.atZone(paris).withEarlierOffsetAtOverlap().toInstant());
        observe("overlap.later", overlap.atZone(paris).withLaterOffsetAtOverlap().toInstant());
        var start = ZonedDateTime.of(2026, 3, 28, 9, 0, 0, 0, paris);
        var elapsed = start.plus(Duration.ofHours(24));
        var calendar = start.plus(Period.ofDays(1));
        observe("duration.local", elapsed.toOffsetDateTime());
        observe("period.local", calendar.toOffsetDateTime());
        observe("period.elapsedHours", Duration.between(start, calendar).toHours());
        var instant = Instant.parse("2026-08-31T05:00:00Z");
        observe("instant.seoul", instant.atZone(ZoneId.of("Asia/Seoul")).toOffsetDateTime());
        observe("instant.newYork", instant.atZone(ZoneId.of("America/New_York")).toOffsetDateTime());
    }

    private static void concurrency() throws Exception {
        var atomic = new AtomicInteger(0);
        observe("cas.first", atomic.compareAndSet(0, 1));
        observe("cas.stale", atomic.compareAndSet(0, 1));
        observe("cas.retry", atomic.compareAndSet(1, 2));
        observe("cas.current", atomic.get());
        var failed = new CompletableFuture<String>();
        var pending = new CompletableFuture<String>();
        var all = CompletableFuture.allOf(failed, pending);
        failed.completeExceptionally(new IllegalStateException("failed"));
        observe("allOf.afterFirstFailure", all.isDone());
        pending.complete("done");
        observe("allOf.afterAllComplete", all.isCompletedExceptionally());
        var gate = new CountDownLatch(3);
        gate.countDown(); gate.countDown();
        observe("latch.beforeLast", gate.getCount());
        gate.countDown(); gate.await();
        observe("latch.open", gate.getCount());
        var permits = new Semaphore(3);
        permits.acquire(3);
        observe("semaphore.full", permits.availablePermits());
        permits.release();
        observe("semaphore.released", permits.availablePermits());
        var queue = new ArrayBlockingQueue<String>(1);
        queue.put("A");
        observe("queue.offerWhenFull", queue.offer("B"));
        observe("queue.received", queue.take());
        var finish = new CountDownLatch(1);
        Thread worker = Thread.ofPlatform().start(() -> {
            try { finish.await(); } catch (InterruptedException error) { Thread.currentThread().interrupt(); }
        });
        try {
            worker.join(1);
            observe("timedJoin.workerAlive", worker.isAlive());
        } finally { finish.countDown(); worker.join(); }
        observe("join.workerAlive", worker.isAlive());
        var stopped = new ThreadPoolExecutor(1, 1, 0, TimeUnit.SECONDS, new ArrayBlockingQueue<>(1), new ThreadPoolExecutor.CallerRunsPolicy());
        stopped.shutdown();
        var discarded = stopped.submit(() -> {});
        observe("callerRuns.shutdownFutureDone", discarded.isDone());
        discarded.cancel(false);
        var requestId = ScopedValue.<String>newInstance();
        ScopedValue.where(requestId, "outer").call(() -> {
            observe("scoped.outer", requestId.get());
            ScopedValue.where(requestId, "inner").run(() -> observe("scoped.inner", requestId.get()));
            observe("scoped.restored", requestId.get());
            try (var scope = StructuredTaskScope.open()) {
                var child = scope.fork(requestId::get);
                scope.join();
                observe("scoped.child", child.get());
            }
            return null;
        });
        observe("scoped.boundAfterExit", requestId.isBound());
    }

    private static void initializationAndBytecode() throws Exception {
        Class<?> type = Constants.class;
        int port = Constants.PORT;
        observe("initialization.literalAndConstant", initialization.isEmpty() && port == 8080 && type != null);
        observe("initialization.parentValue", Child.value);
        observe("initialization.events", initialization);
        var directory = Files.createTempDirectory("csforge-bytecode-");
        var source = directory.resolve("Example.java");
        var compiled = directory.resolve("Example.class");
        try {
            Files.writeString(source, "public class Example { public int add(int a, int b) { return a + b; } }");
            int status = ToolProvider.getSystemJavaCompiler().run(null, null, null, "--release", "25", "-g:none", "-d", directory.toString(), source.toString());
            if (status != 0) throw new AssertionError("javac " + status);
            var output = new StringWriter();
            int result = java.util.spi.ToolProvider.findFirst("javap").orElseThrow().run(new PrintWriter(output), new PrintWriter(System.err), "-c", "-classpath", directory.toString(), "Example");
            if (result != 0) throw new AssertionError("javap " + result);
            String code = output.toString().split("public int add", 2)[1];
            observe("bytecode.operations", String.join(",", code.lines().filter(line -> line.matches("\\s*\\d+:.*")).map(line -> line.strip().split("\\s+")[1]).toList()));
            try (var loader = new java.net.URLClassLoader(new java.net.URL[]{directory.toUri().toURL()})) {
                var example = loader.loadClass("Example");
                observe("bytecode.result", example.getMethod("add", int.class, int.class).invoke(example.getConstructor().newInstance(), 3, 4));
            }
        } finally {
            Files.deleteIfExists(compiled); Files.deleteIfExists(source); Files.deleteIfExists(directory);
        }
    }
}
