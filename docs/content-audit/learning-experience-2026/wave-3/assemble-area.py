"""Assemble pinned Network Topic ledgers; do not infer or create review decisions."""

import argparse
import hashlib
import json
import sys
from pathlib import Path

from importlib.util import module_from_spec, spec_from_file_location


BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[3]
COUNTS = {"network-http": (15, 127, 381)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("area", choices=COUNTS)
    args = parser.parse_args()
    sys.dont_write_bytecode = True
    spec = spec_from_file_location("checkpoint_topic", BASE / "checkpoint-topic.py")
    checkpoint = module_from_spec(spec)
    spec.loader.exec_module(checkpoint)
    parts = []
    for path in sorted((BASE / "topics").glob(args.area + "--*.json")):
        sys.argv = [str(BASE / "checkpoint-topic.py"), str(path)]
        checkpoint.main()
        parts.append(json.loads(path.read_text(encoding="utf-8")))
    expected_topics, expected_cs, expected_qs = COUNTS[args.area]
    assert len(parts) == expected_topics
    data = {
        "area": args.area, "wave": "Wave 3",
        "baselineSha": "efe73a15da14c996bd08344181d4d6f87073803d",
        "reviewMethod": "모든 Topic의 canonical Concept 본문과 연결 Question의 모든 필드를 직접 읽어 "
                        "Topic별 수기 근거를 확정한 뒤 조립했다. 기술/학습 목표/깊이/흐름·상태/코드/가독성/"
                        "오해/Level·순서/도식화/Reference와 개별 정답·모든 보기·rationale·acceptedAnswers/"
                        "modelAnswer/explanation·모호성/난이도/목표 반복·연결을 검토했다. "
                        "자동 추출·이전 PASS·길이·이미지 수가 품질 판정 근거가 아니다. "
                        "공식 출처는 실제 읽은 관련 절의 의미만 확인했고 접근 및 추가 검토 한계는 별도로 남겼다.",
        "topics": [{"key": p["topicKey"], "coverage": p["coverage"]} for p in parts],
    }
    for field in ("concepts", "questions", "findings", "carriedForwardFindings", "visualizationAssets"):
        data[field] = [row for p in parts for row in p.get(field, [])]
    for field in ("sources", "supplementalSources"):
        merged = {}
        for p in parts:
            for url, status, basis in p.get(field, []):
                entry = merged.setdefault(url, [url, status, []])
                if status == "NEEDS_REVIEW":
                    entry[1] = status
                entry[2].append(p["topic"] + ": " + basis)
        data[field] = [[url, status, " | ".join(bases)] for url, status, bases in merged.values()]
    data["referenceAccess"] = {}
    data["sourceHashes"] = {}
    for p in parts:
        for url, access in p.get("referenceAccess", {}).items():
            entry = data["referenceAccess"].setdefault(url, dict(access))
            assert entry["status"] == access["status"], "Conflicting access status"
        assert not data["sourceHashes"].keys() & p["sourceHashes"].keys()
        data["sourceHashes"].update(p["sourceHashes"])
    for field, path in (("curriculumSha256", ROOT / "content/curriculum" / (args.area + ".yaml")),
                        ("topicCatalogSha256", ROOT / "content" / args.area / "topics.json")):
        data[field] = hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()
    assert len(data["concepts"]) == expected_cs and len(data["questions"]) == expected_qs
    keys = [r[0] for r in data["concepts"] + data["questions"]]
    assert len(keys) == len(set(keys)) and set(keys) == set(data["sourceHashes"])
    inventory = json.loads((BASE.parent / "inventory.json").read_text(encoding="utf-8"))["concepts"]
    inventory += json.loads((BASE.parent / "question-inventory.json").read_text(encoding="utf-8"))["questions"]
    assert set(keys) == {i["contentKey"] for i in inventory if i["area"] == args.area}
    (BASE / (args.area + ".json")).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"Assembled {args.area}: {expected_topics} T / {expected_cs} C / {expected_qs} Q")


if __name__ == "__main__":
    main()
