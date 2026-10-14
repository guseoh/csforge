"""Probe only the disputed switch return and nested interface static wording."""

from pathlib import Path
import subprocess
import tempfile


with tempfile.TemporaryDirectory(prefix="csforge-modern-audit-") as directory:
    path = Path(directory) / "Probe.java"
    path.write_text('class Probe { static String value(int n) { return switch(n) { '
                    'case 1 -> { return "ONE"; } default -> "OTHER"; }; } }', encoding="utf-8")
    bad = subprocess.run(["javac", "-J-Duser.language=en", "-d", directory, str(path)],
                         capture_output=True, text=True, encoding="utf-8")
    assert bad.returncode != 0 and "return out of a switch expression" in bad.stderr, bad.stderr
    path.write_text('class Probe { '
                    'interface A { default String label() { return "implicit"; } } '
                    'static interface B { default String label() { return "explicit"; } } '
                    'static class CA implements A {} static class CB implements B {} '
                    'static String value(int n) { return switch(n) { '
                    'case 1 -> { yield "ONE"; } default -> "OTHER"; }; } '
                    'public static void main(String[] args) { '
                    'System.out.println("yield="+value(1)+";implicitInterface="+new CA().label()+'
                    '";explicitStaticInterface="+new CB().label()); } }', encoding="utf-8")
    good = subprocess.run(["javac", "-J-Duser.language=en", "-d", directory, str(path)],
                          capture_output=True, text=True, encoding="utf-8")
    assert good.returncode == 0, good.stderr
    output = subprocess.check_output(["java", "-cp", directory, "Probe"], text=True).strip()
    assert output == "yield=ONE;implicitInterface=implicit;explicitStaticInterface=explicit", output
    print(subprocess.check_output(["javac", "-version"], text=True).strip())
    print("returnInSwitchExpression=compile-error")
    print(output)
