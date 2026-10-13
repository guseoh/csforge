"""Validate authored Topic evidence; --pin records only missing source hashes."""

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / "docs/content-audit/learning-experience-2026"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("topic_file", type=Path)
    parser.add_argument("--pin", action="store_true")
    args = parser.parse_args()
    data = json.loads(args.topic_file.read_text(encoding="utf-8"))
    inventory = json.loads((BASE / "inventory.json").read_text(encoding="utf-8"))["concepts"]
    inventory += json.loads((BASE / "question-inventory.json").read_text(encoding="utf-8"))["questions"]
    expected = {item["contentKey"]: item for item in inventory
                if item["area"] == data["area"] and item["file"].split("/")[-2] == data["topic"]}
    rows = data["concepts"] + data["questions"]
    keys = [row[0] for row in rows]
    assert len(keys) == len(set(keys)) and set(keys) == set(expected), "Coverage mismatch"
    findings = data.get("findings", []) + data.get("carriedForwardFindings", [])
    area_keys = {item["contentKey"] for item in inventory if item["area"] == data["area"]}
    assert {key for finding in findings for key in finding["contentKeys"]} <= area_keys
    # A finding may connect concepts in different Topics of the same Area.
    area_file = args.topic_file.parent.parent / f'{data["area"]}.json'
    related_findings = list(findings)
    if area_file.exists():
        area_data = json.loads(area_file.read_text(encoding="utf-8"))
        related_findings += area_data.get("findings", []) + area_data.get("carriedForwardFindings", [])
    affected = {key for finding in related_findings for key in finding["contentKeys"]}
    for kind, width in (("concepts", 7), ("questions", 4)):
        for row in data[kind]:
            assert len(row) == width and all(isinstance(v, str) and v.strip() for v in row)
            assert (row[1] in {"TARGETED_ENHANCE", "REWRITE_REQUIRED"}) == (row[0] in affected)
    for finding in findings:
        for anchor in [finding] + finding.get("additionalEvidence", []):
            raw = (ROOT / anchor["file"]).read_text(encoding="utf-8")
            quote = anchor["quote"]
            assert quote in raw or json.dumps(quote, ensure_ascii=False)[1:-1] in raw, finding["id"]
    hashes = {}
    for key, item in sorted(expected.items()):
        path = ROOT / item["file"]
        if "arrayIndex" in item:
            raw = json.loads(path.read_text(encoding="utf-8"))[item["arrayIndex"]]
            digest = sha(json.dumps(raw, ensure_ascii=False, sort_keys=True).encode("utf-8"))
        else:
            digest = sha(path.read_bytes().replace(b"\r\n", b"\n"))
        assert digest == item["sourceSha256"], f"Inventory source mismatch: {key}"
        hashes[key] = digest
    if "sourceHashes" in data:
        assert data["sourceHashes"] == hashes, "Pinned sources changed"
    else:
        assert args.pin, "Missing hashes; pin only after actual semantic review"
        data["sourceHashes"] = hashes
    for asset in data.get("visualizationAssets", []):
        digest = sha((ROOT / asset["file"]).read_bytes().replace(b"\r\n", b"\n"))
        if "sourceSha256" in asset:
            assert asset["sourceSha256"] == digest, "Pinned asset changed"
        else:
            assert args.pin
            asset["sourceSha256"] = digest
    if args.pin:
        args.topic_file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f'{data["topic"]}: {len(data["concepts"])} C / {len(data["questions"])} Q; evidence/hash/quotes PASS')


if __name__ == "__main__":
    main()
