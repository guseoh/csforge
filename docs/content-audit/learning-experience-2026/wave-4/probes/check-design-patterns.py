"""Reconstruct only the disputed Factory call and omitted abstract implementation."""

from pathlib import Path
import re
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[5]
text = (ROOT / "content/java/design-patterns/template-method-pattern.md").read_text(encoding="utf-8")
blocks = re.findall(r"```java\n(.*?)\n```", text, re.DOTALL)
parent = next(b for b in blocks if b.startswith("abstract class ImportJob"))
child = next(b for b in blocks if b.startswith("class CsvImportJob"))
# Only previously undefined collaborator helpers are supplied. validate remains untouched.
child = child.rsplit("}", 1)[0] + "ParsedData parseCsv() { return null; } void audit(ParsedData data) {} }"


def compile_case(source):
    with tempfile.TemporaryDirectory(prefix="csforge-pattern-audit-") as directory:
        path = Path(directory) / "Probe.java"
        path.write_text(source, encoding="utf-8")
        return subprocess.run(["javac", "-J-Duser.language=en", "-d", directory, str(path)],
                              capture_output=True, text=True, encoding="utf-8")


factory = compile_case('class PaymentProcessorFactory { Object create(String type) { return null; } } '
                       'class Probe { public static void main(String[] args) { PaymentProcessorFactory.create("CARD"); } }')
assert factory.returncode != 0 and "non-static" in factory.stderr, factory.stderr
template = compile_case(parent + child + "class ParsedData {}")
assert template.returncode != 0 and "validate" in template.stderr, template.stderr
print(subprocess.check_output(["javac", "-version"], text=True).strip())
print("factoryClassCall=compile-error:non-static")
print("csvExample=compile-error:missing-validate")
