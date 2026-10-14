"""Compile only the two identified API example issues in temporary directories."""

from pathlib import Path
import re
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[5]
text = (ROOT / "content/java/api-design/builder-pattern-construction.md").read_text(encoding="utf-8")
blocks = re.findall(r"```java\n(.*?)\n```", text, re.DOTALL)
implementation = next(block for block in blocks if block.startswith("final class SearchOption"))
call = next(block for block in blocks if block.startswith("SearchOption option"))


def compile_case(source):
    with tempfile.TemporaryDirectory(prefix="csforge-api-audit-") as directory:
        path = Path(directory) / "Probe.java"
        path.write_text(source, encoding="utf-8")
        return subprocess.run(["javac", "-J-Duser.language=en", "-d", directory, str(path)],
                              capture_output=True, text=True, encoding="utf-8")


prefix = "import java.util.Objects;\n" + implementation
original = compile_case(prefix + "\nclass Probe { public static void main(String[] args) {" + call + "}}")
assert original.returncode != 0 and "includeClosed" in original.stderr, original.stderr
aligned = compile_case(prefix + "\nclass Probe { public static void main(String[] args) {"
                       + call.replace("        .includeClosed(true)\n", "") + "}}")
assert aligned.returncode == 0, aligned.stderr
# Minimal independent reconstruction of the linked article's missing static.
reference = compile_case("class LottoNumber { private LottoNumber() {} "
                         "public LottoNumber of(int number) { return null; } } "
                         "class Probe { public static void main(String[] args) { LottoNumber.of(1); } }")
assert reference.returncode != 0 and "non-static" in reference.stderr, reference.stderr
print(subprocess.check_output(["javac", "-version"], text=True).strip())
print("builderOriginal=compile-error:includeClosed")
print("builderAligned=compile-ok")
print("referenceFactory=compile-error:non-static")
