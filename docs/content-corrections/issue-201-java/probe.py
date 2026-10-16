"""Compile actual corrected canonical excerpts with Java 25; run explicit observations.

Temp files stay outside the canonical tree. Scaffolding supplies imports and omitted
domain collaborators; execution is evidence for these inputs, not a universal JDK guarantee.
"""

import json
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[3]


def blocks(topic, name):
    text = (ROOT / "content/java" / topic / (name + ".md")).read_text(encoding="utf-8")
    return re.findall(r"```java\n(.*?)\n```", text, re.S)


def question(topic, key):
    rows = json.loads((ROOT / "content/java" / topic / "questions.json").read_text(encoding="utf-8"))
    q = next(q for q in rows if q["contentKey"] == "java.core." + topic + "." + key)
    return re.findall(r"```java\n(.*?)\n```", q["promptMarkdown"], re.S)[0]


def main():
    imports = "import java.util.*; import java.util.stream.*; import java.nio.*; import java.lang.reflect.Array;\n"
    jobs = []

    def add(name, body, expected, members="", compile_ok=True):
        source = imports + "public class Probe {\n" + members + "\npublic static void main(String[] args) throws Exception {\n" + body + "\n}}\n"
        jobs.append((name, source, expected, compile_ok))

    add("stream-terminal-output", question("streams", "stream-pipeline-laziness.q2"), "|12")
    add("explicit-left-fold", question("streams", "stream-reduce.q3") + "\nSystem.out.print(result);", "-6")
    add("enum-set", question("enum-modeling", "enumset.q2"), "1\n")
    add("enum-map", question("enum-modeling", "enummap.q2") + "\nSystem.out.print(sunday);", "0")
    add("unboxing-null", "try {\n" + question("language-types", "boxing-unboxing-wrapper.q6") +
        '\n} catch (NullPointerException expected) { System.out.print("NPE"); }', "NPE")
    add("string-concatenation", question("language-types", "string-pool-interning.q4") +
        '\nSystem.out.print((a == "java") + ":" + (b == "java"));', "true:false")
    add("numeric-constant-narrowing", "final byte a=1,b=2; byte c=a+b; System.out.print(c);", "3")
    add("numeric-nonconstant-rejected", question("language-types", "numeric-conversion-overflow.q4"), "", compile_ok=False)
    add("final-runtime-not-constant", "final int value=Integer.parseInt(args[0]); byte b=value;", "", compile_ok=False)
    text = blocks("language-types", "string-immutability-equality")
    add("locale-root", 'Locale.setDefault(Locale.forLanguageTag("tr-TR"));\n' + text[0] + "\n" + text[1], "kim\nKIM\n")
    text = next(s for s in blocks("object-model", "initialization-order-constructor-chaining") if 'private String name = "kim"' in s)
    add("constructor-dispatch", text + "\nChild child=new Child(); child.print();", "null\nkim\n")
    add("constructor-prologue", 'new Child();', "ready\n", members='''
static class Parent { Parent() { print(); } void print() {} }
static class Child extends Parent {
    String name;
    Child() { name = "ready"; super(); }
    @Override void print() { System.out.println(name); }
}
''')
    key = next(s for s in blocks("object-contracts", "hashcode-contract") if "class Key" in s)
    add("hash-key-constructor", key + '\nKey key=new Key("A"); System.out.print(key.value);', "A")
    enum = blocks("enum-modeling", "enumset")[0]
    add("enum-terminal-state", enum + "\nSystem.out.print(terminal);", "[COMPLETED, CANCELLED]")
    builder = blocks("api-design", "builder-pattern-construction")
    add("builder-call", next(s for s in builder if "final class SearchOption" in s) + "\n" +
        next(s for s in builder if "SearchOption option =" in s) + '\nSystem.out.print("built");', "built")
    helper = next(s for s in blocks("generics", "type-erasure-reifiable-types") if "static <T>" in s)
    add("reference-token", 'System.out.print(newArray(String.class,2).getClass().getName());', "[Ljava.lang.String;", members=helper)
    add("primitive-and-void-token", '''
for (Class<?> token : new Class<?>[]{int.class,void.class}) {
    try { newArray(token,1); throw new AssertionError("primitive accepted"); }
    catch (IllegalArgumentException expected) { System.out.print("rejected;"); }
}
System.out.print(newArray(Integer.class,1).getClass().getName());
''', "rejected;rejected;[Ljava.lang.Integer;", members=helper)
    add("nullable-title-comparator", '''
List<String> titles=new ArrayList<>(Arrays.asList("b",null,"a"));
Comparator<String> comparator=Comparator.nullsLast(Comparator.naturalOrder());
titles.sort(comparator); System.out.print(titles);
''', "[a, b, null]")
    add("copyof-and-queue-boundaries", '''
List<String> source=new ArrayList<>(List.of("a")); List<String> copy=List.copyOf(source);
source.add("b"); assert copy.equals(List.of("a"));
try { List.copyOf(Arrays.asList("a",null)); throw new AssertionError(); }
catch (NullPointerException expected) {}
PriorityQueue<Integer> queue=new PriorityQueue<>(); assert queue.peek()==null;
queue.addAll(List.of(3,1,2)); assert queue.peek()==1;
System.out.print("boundaries-ok");
''', "boundaries-ok")
    state = next(s for s in blocks("coding-tests", "priorityqueue-coding-tests") if "record State" in s)
    add("typed-state-queue", "int newDistance=3,node=1;\n" + state +
        '\nSystem.out.print(states.poll());', "State[distance=3, node=1]")
    add("factory-instance-call", '''
PaymentConfig config=new PaymentConfig("card","bank","key","auth");
PaymentType type=PaymentType.CARD;
''' + next(s for s in blocks("design-patterns", "factory-pattern") if "final class PaymentProcessorFactory" in s) +
        "\n" + next(s for s in blocks("design-patterns", "factory-pattern") if "PaymentProcessorFactory factory" in s) +
        '\nSystem.out.print(processor.getClass().getSimpleName());', "CardProcessor", members='''
enum PaymentType { CARD, BANK }
record PaymentConfig(String cardUrl,String bankUrl,String cardKey,String bankKey) {}
interface PaymentProcessor {}
record CardSigner(String key) {}
record BankAuthenticator(String key) {}
record CardProcessor(String url,CardSigner signer) implements PaymentProcessor {}
record BankProcessor(String url,BankAuthenticator auth) implements PaymentProcessor {}
''')
    print(subprocess.run(["javac", "-version"], capture_output=True, text=True, check=True).stdout.strip())
    with tempfile.TemporaryDirectory(prefix="csforge-issue201-java-") as directory:
        for name, source, expected, compile_ok in jobs:
            file = Path(directory) / "Probe.java"
            file.write_text(source, encoding="utf-8")
            compiled = subprocess.run(["javac", "--release", "25", "-encoding", "UTF-8", "-d", directory, str(file)],
                                      capture_output=True, encoding="utf-8")
            assert (compiled.returncode == 0) == compile_ok, (name, compiled.stderr)
            if compile_ok:
                result = subprocess.run(["java", "-ea", "-Dfile.encoding=UTF-8", "-cp", directory, "Probe"],
                                        capture_output=True, encoding="utf-8", check=True)
                assert result.stdout == expected, (name, result.stdout, expected)
            print(name + ": PASS" + (" (compile rejected)" if not compile_ok else ""))
    print(f"{len(jobs)} source/contract probes PASS")


if __name__ == "__main__":
    main()
