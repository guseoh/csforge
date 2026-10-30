"""Validate Java correction identity, Reference isolation and reproducible source inventory.

--write updates mechanical hashes/counts only; resolutions.json is handwritten.
The merged #223 ledger remains historical evidence and is never regenerated here.
"""

import argparse
import difflib
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile
from functools import lru_cache
import xml.etree.ElementTree as ET

import yaml

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = "90f7c5bddcf074a08e523b8b54130ebfce96a28d"


@lru_cache(maxsize=1)
def baseline_files():
    archive = subprocess.check_output([
        "git", "archive", BASE, "content/java", "content/curriculum/java.yaml",
        "frontend/public/learning/java"], cwd=ROOT)
    with tarfile.open(fileobj=io.BytesIO(archive)) as source:
        return {entry.name: source.extractfile(entry).read().decode("utf-8").replace("\r\n", "\n")
                for entry in source if entry.isfile()}


def previous(path):
    return baseline_files()[path]


def sha(text):
    return hashlib.sha256(text.replace("\r\n", "\n").encode("utf-8")).hexdigest()


def object_sha(item):
    return sha(json.dumps(item, ensure_ascii=False, sort_keys=True))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    findings = json.loads((ROOT / "docs/content-audit/learning-experience-2026/wave-4/findings.json").read_text(encoding="utf-8"))
    decisions = json.loads((HERE / "resolutions.json").read_text(encoding="utf-8"))
    assert len(decisions) == 50 and len({d["id"] for d in decisions}) == 50
    assert {d["id"] for d in decisions} == {f["id"] for f in findings} | {"LEX-002"}
    assert all(d["resolution"] and d["status"] in {"CORRECTED", "REFERENCE_222", "NOT_SELECTED_P2"}
               for d in decisions)
    reference_only = {f["id"] for f in findings if 222 in f["followupIssues"]}
    assert {d["id"] for d in decisions if d["status"] == "REFERENCE_222"} == reference_only
    assert all(d["status"] != "NOT_SELECTED_P2" for d in decisions
               if next((f["severity"] for f in findings if f["id"] == d["id"]), "P2") != "P2")

    files = subprocess.check_output([
        "git", "ls-tree", "-r", "--name-only", BASE, "content/java"], cwd=ROOT).decode("utf-8").splitlines()
    concepts, questions, changed = {}, {}, []
    current_files = {p.relative_to(ROOT).as_posix() for p in (ROOT / "content/java").rglob("*") if p.is_file()}
    assert current_files == set(files), "Java files added/removed"
    expected_rows = []
    for file in files:
        old, new = previous(file), (ROOT / file).read_text(encoding="utf-8")
        if file.endswith(".md"):
            old_meta = yaml.safe_load(old.split("---", 2)[1])
            meta = yaml.safe_load(new.split("---", 2)[1])
            assert meta == old_meta, "Concept metadata/Reference changed: " + file
            assert meta["contentKey"] not in concepts
            concepts[meta["contentKey"]] = meta
            assert new.split("---", 2)[2].lstrip().startswith("# ")
            if old != new:
                first = next(op[3] + 1 for op in difflib.SequenceMatcher(
                    a=old.splitlines(), b=new.splitlines()).get_opcodes() if op[0] != "equal")
                changed.append({"file": file, "contentKey": meta["contentKey"], "line": first,
                                "beforeSha256": sha(old), "afterSha256": sha(new)})
        elif file.endswith("questions.json"):
            before, after = json.loads(old), json.loads(new)
            assert [q["contentKey"] for q in before] == [q["contentKey"] for q in after]
            for original, q in zip(before, after, strict=True):
                key = q["contentKey"]
                assert key not in questions
                questions[key] = q
                for field in ("kind", "contentKey", "questionType", "difficulty", "status", "conceptKeys", "correctChoiceKey"):
                    assert original.get(field) == q.get(field), (key, field)
                if q["questionType"] == "MULTIPLE_CHOICE":
                    assert [(c["key"], c["displayOrder"]) for c in original["choices"]] == [
                        (c["key"], c["displayOrder"]) for c in q["choices"]]
                    assert len({c["key"] for c in q["choices"]}) == len(q["choices"])
                    assert q["correctChoiceKey"] in {c["key"] for c in q["choices"]}
                    assert all(c["content"] and c["rationaleMarkdown"] for c in q["choices"])
                assert q["promptMarkdown"] and q["explanationMarkdown"]
                if original != q:
                    literal = json.dumps(key, ensure_ascii=False)
                    expected_rows.append({"contentKey": key, "file": file,
                                          "line": next(i for i, line in enumerate(new.splitlines(), 1) if literal in line),
                                          "beforeSha256": object_sha(original), "afterSha256": object_sha(q),
                                          "changedFields": [field for field in q if q[field] != original.get(field)]})
        else:
            assert old == new, "Topic/catalog changed: " + file
    assert (len(concepts), len(questions)) == (145, 841)
    for q in questions.values():
        assert q["conceptKeys"] and set(q["conceptKeys"]) <= set(concepts), q["contentKey"]
    assert {k for q in questions.values() for k in q["conceptKeys"]} == set(concepts)
    curriculum = "content/curriculum/java.yaml"
    assert previous(curriculum) == (ROOT / curriculum).read_text(encoding="utf-8")
    catalog = yaml.safe_load((ROOT / curriculum).read_text(encoding="utf-8"))
    # The original curriculum key layout is checked independently by the import validator.
    assert catalog and len(json.loads((ROOT / "content/java/topics.json").read_text(encoding="utf-8"))) == 18
    for path in sorted((ROOT / "frontend/public/learning/java").glob("*.svg")):
        relative = path.relative_to(ROOT).as_posix()
        old, new = previous(relative), path.read_text(encoding="utf-8")
        svg = ET.fromstring(new)
        ns = {"s": "http://www.w3.org/2000/svg"}
        assert svg.find("s:title", ns) is not None and svg.find("s:desc", ns) is not None
        if old != new:
            changed.append({"file": relative, "beforeSha256": sha(old), "afterSha256": sha(new)})
    changed_paths = set(subprocess.check_output(["git", "diff", BASE, "--name-only"], cwd=ROOT).decode().splitlines())
    assert all(p.startswith(("content/java/", "frontend/public/learning/java/", "docs/content-corrections/issue-201-java/"))
               for p in changed_paths), "Out-of-scope change"
    current_keys = set(concepts) | set(questions)
    covered_paths = set()
    for d in decisions:
        assert set(d["contentKeys"]) <= current_keys
        if d["status"] == "CORRECTED":
            assert d["files"] and set(d["files"]) <= changed_paths
            covered_paths.update(d["files"])
    assert {r["file"] for r in changed + expected_rows} <= covered_paths
    manifest = {"base": BASE, "topics": 18, "concepts": 145, "questions": 841,
                "changedConcepts": len([r for r in changed if r["file"].endswith(".md")]),
                "changedQuestions": len(expected_rows),
                "changedSvg": len([r for r in changed if r["file"].endswith(".svg")]),
                "sources": changed, "questionChanges": expected_rows,
                "referencesChanged": 0, "identityOrAnswerKeyChanges": 0}
    target = HERE / "source-checkpoint.json"
    encoded = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        target.write_text(encoded, encoding="utf-8")
    else:
        assert target.read_text(encoding="utf-8") == encoded, "Stale correction checkpoint; run --write"
    print(json.dumps({k: v for k, v in manifest.items() if k not in {"sources", "questionChanges"}}))


if __name__ == "__main__":
    main()
