"""Reconcile current canonical Reference relations with historical Wave 1-4 evidence.

This is an evidence inventory, NOT a source-content or URL liveness verifier.
Requires PyYAML; does not access network or mutate PostgreSQL.
Run from repo root: python docs/content-corrections/issue-222-r2/reconcile.py --out /tmp/r2-report.json
"""
from __future__ import annotations

import argparse
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "docs" / "content-audit" / "learning-experience-2026"
FIELDS = ("title", "referenceType", "language", "depth", "recommendation")
WAVES = {
    "wave-1": (
        "cache", "distributed-systems", "infrastructure-cloud",
        "messaging-async", "performance-observability-operations", "system-design",
    ),
    "wave-2": ("backend-engineering", "database", "security", "spring"),
    "wave-3": ("computer-architecture", "dsa", "network-http", "operating-systems"),
}
EXPECTED_AREAS = set().union(*map(set, WAVES.values())) | {"java"}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def parse_frontmatter(path: Path):
    data = path.read_text(encoding="utf-8")
    assert data.startswith("---\n"), str(path)
    meta = yaml.safe_load(data.split("---", 2)[1])
    assert isinstance(meta, dict) and meta.get("kind") == "concept", str(path)
    return meta


def current_relations():
    rows = []
    global_metadata = {}
    keys = set()
    per_area_concepts = Counter()
    for file in sorted((ROOT / "content").glob("*/*/*.md")):
        meta = parse_frontmatter(file)
        key = meta["contentKey"]
        assert key not in keys, ("duplicate contentKey", key)
        keys.add(key)
        area = file.relative_to(ROOT / "content").parts[0]
        per_area_concepts[area] += 1
        local_urls = set()
        local_order = set()
        for ref in meta.get("references") or []:
            url = ref["url"]
            assert url not in local_urls, ("duplicate Reference relation", key, url)
            local_urls.add(url)
            order = ref.get("displayOrder")
            assert order not in local_order, ("duplicate displayOrder", key, order)
            local_order.add(order)
            fields = {name: ref.get(name) for name in FIELDS}
            if url in global_metadata:
                assert fields == global_metadata[url]["metadata"], (
                    "global shared URL metadata conflict", key, url,
                    global_metadata[url]["sourceFile"],
                    fields, global_metadata[url]["metadata"],
                )
            else:
                global_metadata[url] = {
                    "metadata": fields,
                    "sourceFile": file.relative_to(ROOT).as_posix(),
                }
            rows.append({
                "area": area,
                "contentKey": key,
                "file": file.relative_to(ROOT).as_posix(),
                "url": url,
                "title": ref["title"],
                "relationNote": ref.get("relationNote"),
                "evidenceFlags": [],
            })
    assert set(per_area_concepts) == EXPECTED_AREAS, sorted(per_area_concepts)
    assert sum(per_area_concepts.values()) == 721, per_area_concepts
    return rows, global_metadata, per_area_concepts


def historical_waves():
    """Earlier waves' sources are URL-level, NOT per-Concept verified relations."""
    records = {}
    for wave, areas in WAVES.items():
        for area in areas:
            path = AUDIT / wave / (area + ".json")
            ledger = load_json(path)
            for item in ledger["sources"]:
                url, status, basis = item[:3]
                records[(area, url)] = {
                    "wave": wave,
                    "originalStatus": status,
                    "basis": basis,
                    "sourceFile": path.relative_to(ROOT).as_posix(),
                    "evidenceGranularity": "area_url",
                }
    return records


def reconcile():
    rows, global_metadata, counts = current_relations()
    by_key_url = {(row["contentKey"], row["url"]): row for row in rows}
    assert len(by_key_url) == len(rows)
    historical = historical_waves()
    pending_by_area = Counter()
    historical_url_counts = Counter()
    for row in rows:
        old = historical.get((row["area"], row["url"]))
        if old and old["originalStatus"] == "NEEDS_REVIEW":
            row["evidenceFlags"].append("PRIOR_WAVE_1_3_AREA_URL_NEEDS_REVIEW")
            pending_by_area[row["area"]] += 1
        if old:
            historical_url_counts[old["wave"]] += 1

    wave3 = load_json(AUDIT / "wave-3-reference-issues.json")
    wave3_current, wave3_missing, wave3_in_review = [], [], []
    for item in wave3:
        identity = (item["contentKey"], item["url"])
        status = item["verification"]["status"]
        live = by_key_url.get(identity)
        if live is None:
            wave3_missing.append({"area": item["area"], "contentKey": identity[0], "url": identity[1], "originalStatus": status})
            continue
        wave3_current.append(item)
        if status == "NEEDS_REVIEW":
            live["evidenceFlags"].append("WAVE_3_RELATION_NEEDS_REVIEW")
            wave3_in_review.append(item)

    java = load_json(AUDIT / "wave-4/reference-relations.json")
    java_missing, java_pending = [], []
    for item in java["references"]:
        identity = (item["contentKey"], item["url"])
        live = by_key_url.get(identity)
        if live is None:
            java_missing.append({"contentKey": identity[0], "url": identity[1], "originalStatus": item["evidenceLevel"]})
            continue
        if item["evidenceLevel"] == "NEEDS_REVIEW":
            # R1 may have kept the historical article with a corrected relationNote.
            # Do not promote CURRENT_VERIFIED without direct source reading evidence.
            live["evidenceFlags"].append("JAVA_WAVE_4_OLD_NEEDS_REVIEW_R1_TRIAGED")
            java_pending.append(item)

    verified = load_json(ROOT / "docs/content-corrections/issue-222-r2/verified-relations.json")
    manually_resolved = []
    seen = set()
    for record in verified:
        identity = (record["contentKey"], record["url"])
        assert identity not in seen, ("duplicate review decision", identity)
        seen.add(identity)
        live = by_key_url.get(identity)
        assert live is not None, ("review target no longer in canonical", identity)
        if not live["evidenceFlags"]:
            # A readable replacement has a new URL, so its historical flag remains
            # attached to the retired URL. Require that exact historical relation.
            retired = (record["contentKey"], record.get("replacesUrl"))
            assert retired not in by_key_url, ("replacement still present", retired)
            assert any((item["contentKey"], item["url"]) == retired
                       and item["verification"]["status"] == "NEEDS_REVIEW"
                       for item in wave3), ("replacement lacks historical target", identity)
            assert (ROOT / record["evidenceDocument"]).is_file(), identity
        assert record["decision"] == "KEEP" and record["evidenceLevel"] == "DIRECT_CONTENT_VERIFIED", identity
        live["r2ManualResolution"] = {
            "decision": record["decision"],
            "evidenceLevel": record["evidenceLevel"],
            "limits": record["limits"],
        }
        manually_resolved.append(record)

    flagged = [x for x in rows if x["evidenceFlags"]]
    remaining_nonjava = [x for x in flagged if x["area"] != "java" and not x.get("r2ManualResolution")]
    by_area = {}
    for area in sorted(EXPECTED_AREAS):
        all_rows = [r for r in rows if r["area"] == area]
        pending_rows = [r for r in all_rows if r["evidenceFlags"]]
        by_area[area] = {
            "concepts": counts[area],
            "relations": len(all_rows),
            "uniqueUrls": len({x["url"] for x in all_rows}),
            "historicalFlaggedRelations": len(pending_rows),
            "flagDistribution": dict(sorted(Counter(f for r in pending_rows for f in r["evidenceFlags"]).items())),
        }

    report = {
        "description": "Historical evidence-to-current canonical reconciliation; not a full source-content audit",
        "canonical": {"areas": len(counts), "concepts": sum(counts.values()), "relations": len(rows),
                      "uniqueUrls": len(global_metadata), "globalMetadataConflicts": 0,
                      "duplicateConceptRelations": 0, "duplicateDisplayOrders": 0},
        "historicalWave3": {
            "rows": len(wave3), "stillPresent": len(wave3_current),
            "missingAfterChanges": wave3_missing, "needsReviewStillPresent": len(wave3_in_review),
        },
        "historicalJavaWave4": {
            "rows": len(java["references"]), "stillPresent": len(java["references"]) - len(java_missing),
            "missingAfterR1": java_missing, "oldNeedsReviewStillPresent": len(java_pending),
            "disclaimer": "R1 resolved relation applicability/notes but direct article access limits remain",
        },
        "byArea": by_area,
        "historicalFlaggedRelations": len(flagged),
        "r2ManualVerifiedRelations": len(manually_resolved),
        "remainingNonJavaReviewCandidates": len(remaining_nonjava),
        "currentRelations": rows,
        "confirmedExternalFindings": [
            {"key": "infrastructure.core.reliability.backup-restore",
             "url": "https://csrc.nist.gov/pubs/sp/800/34/r1/final",
             "finding": "Withdrawn NIST version; updated official edition exists",
             "fixPr": 230},
            {"key": "security.core.auth-architecture.user-details",
             "url": "https://docs.spring.io/spring-security/reference/servlet/authentication/passwords/user-details.html",
             "finding": "UserDetails page mismatched with UserDetailsService title",
             "fixPr": 227},
            {"key": "network-http.core.http-state-intermediary.cookie",
             "url": "https://www.rfc-editor.org/rfc/rfc10025.html",
             "finding": "RFC-to-be 10025 remains in final review, not yet a published RFC (3 cookie relations)",
             "fixPr": 229},
            {"key": "operating-systems.core.threads.user-level-thread",
             "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf",
             "finding": "Threads Intro does not document user-level logical-to-kernel M:N mapping and blocking (one note)",
             "fixPr": 231},
        ],
    }
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    result = reconcile()
    compact = {k: v for k, v in result.items() if k != "currentRelations"}
    compact["historicalJavaWave4"]["missingAfterR1"] = compact["historicalJavaWave4"]["missingAfterR1"][:8]
    compact["historicalWave3"]["missingAfterChanges"] = compact["historicalWave3"]["missingAfterChanges"][:8]
    print("R2_CANONICAL_SUMMARY " + json.dumps(result["canonical"], ensure_ascii=False, sort_keys=True))
    print("R2_HISTORICAL_SUMMARY " + json.dumps({
        "Wave3": {k: v for k, v in result["historicalWave3"].items() if not isinstance(v, list)},
        "JavaWave4": {k: v for k, v in result["historicalJavaWave4"].items() if not isinstance(v, list)},
        "flaggedRelations": result["historicalFlaggedRelations"],
        "manualVerified": result["r2ManualVerifiedRelations"],
        "nonJavaRemaining": result["remainingNonJavaReviewCandidates"],
    }, ensure_ascii=False, sort_keys=True))
    print("R2_AREA_SUMMARY " + json.dumps(result["byArea"], ensure_ascii=False, sort_keys=True))
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
