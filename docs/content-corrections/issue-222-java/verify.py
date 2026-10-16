"""Check Issue #222 R1 reference-only edits and cross-area global URL metadata.

Run in repository root on the R1 branch:
    python docs/content-corrections/issue-222-java/verify.py

Requires PyYAML; this script does not perform HTTP Import or validate external article content.
"""
from __future__ import annotations

import subprocess
from collections import defaultdict
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]
BASE = "2ab1ccbb29ca0bc07858c20f56ae3a4826018d4f"
DOC_PREFIX = "docs/content-corrections/issue-222-java/"
AUXILIARY_PATHS = {
    "backend/src/test/java/com/guseoh/csforge/importcontent/JavaReferenceCorrectionIntegrationTest.java",
    ".github/workflows/repository-validation.yml",  # temporary PR-only CI instrumentation
}
CHANGED_CONCEPTS = {
    "api-design/static-factory-method",
    "collections/hashmap-hashing-collision",
    "concurrency/platform-virtual-thread",
    "concurrency/thread-lifecycle-interruption",
    "design-patterns/strategy-pattern",
    "exceptions-resources/try-with-resources-suppressed",
    "functional/behavior-parameterization",
    "io-nio/byte-character-stream-charset",
    "io-nio/path-files-api",
    "jvm-runtime/gc-fundamentals-collectors",
    "jvm-runtime/gc-reachability-roots",
    "jvm-runtime/jit-hotspot-warmup",
    "jvm-runtime/jvm-runtime-data-areas-frames",
    "jvm-runtime/reference-strengths",
    "jvm-runtime/runtime-diagnostics-jcmd-jstack-jfr",
    "language-types/primitive-reference-values",
    "metadata-compatibility/serialization-contract-risk",
    "object-contracts/equals-contract",
    "object-contracts/hashcode-contract",
    "object-model/class-object-constructor",
    "streams/stream-pipeline-laziness",
    "time-numeric/instant-local-zoned-time",
}
EXPECTED_PATHS = {"content/java/" + slug + ".md" for slug in CHANGED_CONCEPTS}
REMOVED_URLS = {
    "https://tecoble.techcourse.co.kr/post/2020-05-26-static-factory-method/",
    "https://tecoble.techcourse.co.kr/post/2020-06-11-value-object/",
    "https://tecoble.techcourse.co.kr/post/2020-07-29-equals-and-hashCode/",
    "https://tecoble.techcourse.co.kr/post/2021-05-17-constructor/",
    "https://d2.naver.com/helloworld/4911107",
}
SHARED_TITLES = {
    "https://d2.naver.com/helloworld/1219": "JDK 7",
    "https://techblog.woowahan.com/2588/": "신규 포인트 시스템 전환기 #2 – 오픈 준비 단계",
}
REFERENCE_FIELDS = ("title", "referenceType", "language", "depth", "recommendation")


def parse_concept(source: str, path: str):
    assert source.startswith("---\n"), path
    parts = source.split("---", 2)
    assert len(parts) == 3, path
    return yaml.safe_load(parts[1]), parts[2]


def old_file(path: str):
    return subprocess.run(
        ["git", "show", f"{BASE}:{path}"], cwd=ROOT,
        capture_output=True, text=True, encoding="utf-8", check=True
    ).stdout


def main():
    changed = set(subprocess.check_output(
        ["git", "diff", "--name-only", BASE, "HEAD"], cwd=ROOT, text=True
    ).splitlines())
    assert changed & {p for p in changed if p.startswith("content/")} == EXPECTED_PATHS, changed
    assert all(p in EXPECTED_PATHS or p.startswith(DOC_PREFIX) or p in AUXILIARY_PATHS for p in changed), changed
    assert len(EXPECTED_PATHS) == 22
    deleted_relations, title_changes, note_changes = [], [], []
    concept_keys = set()
    by_url = {}
    area_counts = defaultdict(int)
    for file in sorted((ROOT / "content").glob("*/*/*.md")):
        path = file.relative_to(ROOT).as_posix()
        meta, body = parse_concept(file.read_text(encoding="utf-8"), path)
        assert meta.get("kind") == "concept", path
        content_key = meta["contentKey"]
        assert content_key not in concept_keys, content_key
        concept_keys.add(content_key)
        area_counts[file.parts[-3]] += 1
        local_urls = set()
        for item in meta.get("references") or []:
            url = item["url"]
            assert url not in local_urls, (path, url)
            local_urls.add(url)
            values = tuple(item.get(k) for k in REFERENCE_FIELDS)
            if url in by_url:
                assert by_url[url][0] == values, (url, by_url[url][1], path)
            else:
                by_url[url] = (values, path)
            if url in SHARED_TITLES:
                assert item["title"] == SHARED_TITLES[url], (path, url, item["title"])
        if path not in EXPECTED_PATHS:
            continue
        old_meta, old_body = parse_concept(old_file(path), path)
        assert body == old_body, ("Concept body changed", path)
        assert {k: v for k, v in meta.items() if k != "references"} == {
            k: v for k, v in old_meta.items() if k != "references"
        }, ("Concept metadata changed", path)
        before_refs = {r["url"]: r for r in old_meta.get("references") or []}
        after_refs = {r["url"]: r for r in meta.get("references") or []}
        assert set(after_refs) <= set(before_refs), ("Added URL", path)
        for url, prev in before_refs.items():
            now = after_refs.get(url)
            if now is None:
                deleted_relations.append((content_key, url))
                assert url in REMOVED_URLS, (path, url)
                continue
            for field in set(prev) | set(now):
                if field in ("relationNote", "title"):
                    continue
                assert prev.get(field) == now.get(field), (path, url, field)
            if prev.get("title") != now.get("title"):
                title_changes.append((content_key, url))
            if prev.get("relationNote") != now.get("relationNote"):
                note_changes.append((content_key, url))
    assert len(area_counts) == 15 and sum(area_counts.values()) == 721, dict(area_counts)
    assert len(deleted_relations) == 5, deleted_relations
    assert len(title_changes) == 3, title_changes
    assert len(note_changes) == 18, note_changes
    assert len(EXPECTED_PATHS) == 22
    print({
        "areaCount": len(area_counts),
        "conceptCount": len(concept_keys),
        "globalReferenceUrls": len(by_url),
        "changedConcepts": len(EXPECTED_PATHS),
        "removedRelations": len(deleted_relations),
        "titleChanges": len(title_changes),
        "relationNoteChanges": len(note_changes),
        "globalMetadataConflicts": 0,
    })


if __name__ == "__main__":
    main()
