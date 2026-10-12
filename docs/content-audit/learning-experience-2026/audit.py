"""Read-only inventory; semantic decisions come only from handwritten review evidence.

Run: python docs/content-audit/learning-experience-2026/audit.py [--check]
Requires the already available PyYAML (tested with 6.0.3); no runtime dependencies.
"""

import argparse
from collections import Counter, defaultdict
from difflib import SequenceMatcher
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

import yaml

sys.dont_write_bytecode = True
from wave_review import WAVE_AREAS, load_wave, summarize_wave


OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
BASELINE = "efe73a15da14c996bd08344181d4d6f87073803d"
DISPOSITIONS = {"KEEP", "TARGETED_ENHANCE", "REWRITE_REQUIRED", "NEEDS_REVIEW"}


class UniqueLoader(yaml.SafeLoader):
    """Reject duplicate YAML properties instead of silently overwriting evidence."""


def unique_mapping(loader, node, deep=False):
    result = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in result:
            raise ValueError(f"Duplicate YAML property: {key}")
        result[key] = loader.construct_object(value_node, deep=deep)
    return result


UniqueLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_mapping)


def unique_json(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON property: {key}")
        result[key] = value
    return result


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"), object_pairs_hook=unique_json)


def sha(path):
    # Canonical sources are text; preserve reproducibility across Git autocrlf checkouts.
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def relative(path):
    return path.relative_to(ROOT).as_posix()


def yaml_read(text):
    return yaml.load(text, Loader=UniqueLoader)


def counted(values):
    return dict(sorted(Counter(values).items()))


def encode_inventory(data):
    """Keep large machine inventories at one record per line, like canonical packs."""
    lines = ["{"]
    entries = list(data.items())
    for index, (key, value) in enumerate(entries):
        suffix = "," if index < len(entries) - 1 else ""
        if isinstance(value, list):
            lines.append(f"  {json.dumps(key)}: [")
            for item_index, item in enumerate(value):
                comma = "," if item_index < len(value) - 1 else ""
                lines.append("    " + json.dumps(item, ensure_ascii=False) + comma)
            lines.append("  ]" + suffix)
        else:
            lines.append(f"  {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)}{suffix}")
    return "\n".join(lines + ["}", ""])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Compare outputs without writing")
    args = parser.parse_args()
    notes = read_json(OUT / "review-notes.json")
    historical = read_json(OUT / "external-evidence.json")
    deployment = read_json(OUT / "deployment-evidence.json")
    deployed_assets = {a["url"]: a for a in deployment["assets"]}
    prior = read_json(ROOT / "docs/content-audit/curriculum-alignment-phase-a.json")
    previous_areas = {a["directory"]: a for a in prior["learningAreas"]}
    errors, topics, concepts, questions, references, assets, candidates = [], [], [], [], [], [], []
    sources = {}

    def track(path):
        sources[relative(path)] = sha(path)

    def require(condition, message):
        if not condition:
            errors.append(message)

    wave_reviews, wave_sources, wave_ledgers = load_wave(OUT, ROOT, BASELINE, read_json, sha, require)

    def decision(key, source_sha):
        reviewed = notes["items"].get(key)
        if key in wave_reviews:
            current = wave_reviews[key]
            require(current["sourceSha256"] == source_sha, f"Stale Wave semantic evidence: {key}")
            return {**current, "priorSampleReview": reviewed} if reviewed else current
        if reviewed:
            require(reviewed["sourceSha256"] == source_sha, f"Stale semantic evidence: {key}")
            require(reviewed["recommendation"] in DISPOSITIONS, f"Invalid disposition: {key}")
            require(bool(reviewed["basis"]), f"Missing semantic basis: {key}")
            return {**reviewed, "qualityDecision": reviewed["recommendation"], "evidenceLevel": "CURRENT_PARTIAL"}
        return {"recommendation": "NEEDS_REVIEW", "severity": None,
                "qualityDecision": "NEEDS_REVIEW", "evidenceLevel": "NEEDS_REVIEW",
                "reviewScope": "INVENTORIED_ONLY",
                "basis": "개별 의미 검토 미완료. 이전 PASS 보존; 수정 확정 대상 아님(README 검토 한계)."}

    def candidate(kind, key, path, evidence):
        candidates.append({"kind": kind, "contentKey": key, "file": path,
                           "evidence": evidence, "status": "UNCONFIRMED", "severity": None})

    for cp in sorted((ROOT / "content/curriculum").glob("*.yaml")):
        track(cp)
        curriculum = yaml_read(cp.read_text(encoding="utf-8"))
        area = cp.stem
        directory = ROOT / "content" / area
        tp = directory / "topics.json"
        track(tp)
        catalog = read_json(tp)
        planned_topics = {t["key"]: t for t in curriculum["topics"]}
        require(len(planned_topics) == len(curriculum["topics"]), f"Duplicate curriculum Topic key: {area}")
        planned_concepts = {}
        for topic in curriculum["topics"]:
            for c in topic["concepts"]:
                require(c["key"] not in planned_concepts, f"Duplicate curriculum key: {c['key']}")
                planned_concepts[c["key"]] = (topic["key"], c)
        require(set(planned_topics) == {t["contentKey"] for t in catalog}, f"Topic parity: {area}")
        require(len({t["displayOrder"] for t in catalog}) == len(catalog), f"Duplicate Topic order: {area}")
        for t in catalog:
            planned = planned_topics.get(t["contentKey"], {})
            require(t["displayOrder"] == planned.get("order"), f"Topic order mismatch: {t['contentKey']}")
            topics.append({"area": area, "contentKey": t["contentKey"], "file": relative(tp),
                           "slug": t["slug"], "title": t["title"], "order": t["displayOrder"],
                           "scope": planned.get("scope"), "boundary": planned.get("boundary")})
        seen = set()
        for path in sorted(directory.rglob("*.md")):
            text = path.read_text(encoding="utf-8-sig")
            match = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n(.*)\Z", text, re.S)
            if not match:
                continue
            meta, body = yaml_read(match[1]), match[2]
            if meta.get("kind") != "concept":
                continue
            track(path)
            key = meta["contentKey"]
            seen.add(key)
            planned_topic, plan = planned_concepts.get(key, (None, {}))
            require(meta["topicContentKey"] == planned_topic, f"Concept Topic mismatch: {key}")
            require(meta["level"] == plan.get("level"), f"Concept level mismatch: {key}")
            if meta["displayOrder"] != plan.get("order"):
                candidate("CONCEPT_ORDER_MISMATCH", key, relative(path),
                          {"canonical": meta["displayOrder"], "curriculum": plan.get("order")})
            require(plan.get("visualization") in {"NONE", "TEXT", "DIAGRAM"}, f"Visualization enum: {key}")
            figures = re.findall(r"!\[([^\]]*)\]\(([^)]+)\)", body)
            fences = re.findall(r"```([^\n]*)\n(.*?)```", body, re.S)
            structural_fences = [code for lang, code in fences if lang.strip() in {"text", "ascii", "mermaid", ""}]
            table_lines = [line for line in body.splitlines() if line.strip().startswith("|")]
            row = {"area": area, "topic": planned_topic, "contentKey": key, "file": relative(path),
                   "title": meta["title"], "learningObjective": plan.get("objective"),
                   "level": meta["level"], "curriculumLevel": plan.get("level"),
                   "order": meta["displayOrder"], "density": plan.get("density"),
                   "prerequisites": plan.get("prerequisites", []), "visualization": plan.get("visualization"),
                   "actualFigureCount": len(figures), "figures": [{"alt": a, "url": u} for a, u in figures],
                   "textVisualizationSignals": {"structuralFenceCount": len(structural_fences), "tableLineCount": len(table_lines)},
                   "referenceEvidence": [], "linkedQuestions": [], "sourceSha256": sha(path),
                   "previousAreaReview": previous_areas[area]["manualAudit"],
                   "priorEvidenceLevel": "PRIOR_REVIEWED",
                   "previousWave": {k: historical["areaWaves"][area][k] for k in ["number", "url", "title"]},
                   "review": decision(key, sha(path))}
            if plan.get("visualization") != "NONE" and not figures and not structural_fences and not table_lines:
                candidate("VISUALIZATION_WITHOUT_EXPLICIT_SIGNAL", key, relative(path), plan.get("visualization"))
            for alt, url in figures:
                if url.startswith("/learning/"):
                    asset = ROOT / "frontend/public" / urlparse(url).path.lstrip("/")
                    require(asset.is_file(), f"Missing local image: {key} {url}")
                else:
                    candidate("REMOTE_OR_UNRECOGNIZED_IMAGE", key, relative(path), url)
                require(bool(alt.strip()), f"Blank image alt: {key}")
            for r in meta.get("references", []):
                ref = {"area": area, "contentKey": key, "file": relative(path), **r,
                       "verification": notes.get("urls", {}).get(r["url"], {"status": "NEEDS_REVIEW", "basis": "이번 감사에서 미접근. 기존 Wave의 출처 확인 근거 보존; URL 존재만으로 학습 가치를 판정하지 않는다."})}
                current_sources = [s for s in wave_sources.get(r["url"], []) if s["area"] == area]
                if current_sources:
                    ref["priorVerification"] = ref["verification"]
                    evidence = current_sources[0]
                    ref["verification"] = {"status": evidence["evidenceLevel"], **evidence}
                    ref["verification"]["qualityIssueIds"] = [
                        f["id"] for f in wave_ledgers[area]["findings"] if f["quote"] == r["url"]
                    ]
                references.append(ref)
                row["referenceEvidence"].append({"url": r["url"], "relationNote": r.get("relationNote"), "verification": ref["verification"]})
                parsed = urlparse(r["url"])
                require(parsed.scheme in {"http", "https"} and bool(parsed.netloc), f"Invalid URL: {key}")
                if parsed.path.rstrip("/") in {"", "/docs", "/docs/latest", "/reference", "/documentation"}:
                    candidate("BROAD_REFERENCE_PATH", key, relative(path), r["url"])
            require(bool(row["referenceEvidence"]), f"Concept without reference: {key}")
            concepts.append(row)
        require(seen == set(planned_concepts), f"Concept parity: {area}")
        for qp in sorted(directory.rglob("questions.json")):
            track(qp)
            for index, q in enumerate(read_json(qp)):
                key = q["contentKey"]
                require(q.get("conceptKeys") and all(k in seen for k in q["conceptKeys"]), f"Question linkage: {key}")
                require(q.get("difficulty") in {"EASY", "MEDIUM", "HARD"}, f"Question difficulty: {key}")
                require(bool(q.get("promptMarkdown", "").strip()), f"Blank prompt: {key}")
                require(bool(q.get("explanationMarkdown", "").strip()), f"Blank explanation: {key}")
                kind = q["questionType"]
                if kind == "MULTIPLE_CHOICE":
                    keys = [c["key"] for c in q.get("choices", [])]
                    require(len(keys) == len(set(keys)) and q.get("correctChoiceKey") in keys, f"MC key: {key}")
                    orders = [c["displayOrder"] for c in q.get("choices", [])]
                    require(len(orders) == len(set(orders)), f"MC duplicate choice order: {key}")
                    require(all(c.get("rationaleMarkdown", "").strip() for c in q.get("choices", [])), f"Blank rationale: {key}")
                elif kind == "SHORT_ANSWER":
                    require(bool(q.get("acceptedAnswers")), f"Short answer: {key}")
                else:
                    require(kind in {"DESCRIPTIVE", "SCENARIO"}, f"Question type: {key}")
                    require(isinstance(q.get("modelAnswer"), str) and bool(q["modelAnswer"].strip()), f"Model answer: {key}")
                    require("choices" not in q and "acceptedAnswers" not in q, f"Self-check shape: {key}")
                    normalized_answer = re.sub(r"[^a-z0-9가-힣]", "", q.get("modelAnswer", "").lower())
                    normalized_explanation = re.sub(r"[^a-z0-9가-힣]", "", q.get("explanationMarkdown", "").lower())
                    similarity = SequenceMatcher(None, normalized_answer, normalized_explanation).ratio()
                    if similarity >= 0.85:
                        candidate("ANSWER_EXPLANATION_OVERLAP", key, relative(qp),
                                  {"normalizedSimilarity": round(similarity, 4), "threshold": 0.85})
                # Source hash covers the individual object, not unrelated questions in the pack.
                qsha = hashlib.sha256(json.dumps(q, ensure_ascii=False, sort_keys=True).encode()).hexdigest()
                questions.append({"area": area, "file": relative(qp), "arrayIndex": index, **q,
                                  "sourceSha256": qsha, "review": decision(key, qsha)})

    by_concept = {c["contentKey"]: c for c in concepts}
    for q in questions:
        for key in q["conceptKeys"]:
            by_concept[key]["linkedQuestions"].append(q["contentKey"])
    for c in concepts:
        require(bool(c["linkedQuestions"]), f"Concept without Questions: {c['contentKey']}")
        if c["review"]["recommendation"] == "KEEP":
            require(all(q["review"]["recommendation"] == "KEEP" for q in questions if q["contentKey"] in c["linkedQuestions"]),
                    f"KEEP without complete linked Question review: {c['contentKey']}")
            if c["contentKey"] in wave_reviews:
                # Canonical review may document an inaccessible supplemental source.
                # KEEP is handwritten, with a checked primary source and explicit limits.
                require(any(r["verification"]["status"] == "CURRENT_VERIFIED" for r in c["referenceEvidence"]),
                        f"Wave KEEP without a checked supporting source: {c['contentKey']}")
            else:
                require(all(r["verification"]["status"] == "CHECKED_RELEVANT" for r in c["referenceEvidence"]),
                        f"KEEP without checked references: {c['contentKey']}")
    for label, items in [("Topic", topics), ("Concept", concepts), ("Question", questions)]:
        keys = [i["contentKey"] for i in items]
        require(len(keys) == len(set(keys)), f"Global duplicate {label} key")
    for topic in topics:
        children = [c for c in concepts if c["topic"] == topic["contentKey"]]
        require(len({c["order"] for c in children}) == len(children), f"Duplicate Concept order: {topic['contentKey']}")
    graph = {c["contentKey"]: c["prerequisites"] for c in concepts}
    active, done = set(), set()

    def visit(key):
        if key in active:
            errors.append(f"Prerequisite cycle: {key}")
            return
        if key in done:
            return
        active.add(key)
        for target in graph[key]:
            require(target in graph, f"Missing prerequisite: {key} -> {target}")
            if target in graph:
                visit(target)
        active.remove(key)
        done.add(key)

    for key in graph:
        visit(key)
    global_refs = defaultdict(set)
    for ref in references:
        global_refs[ref["url"]].add(json.dumps({k: ref.get(k) for k in ["title", "referenceType", "language", "depth", "recommendation"]}, sort_keys=True))
    require(all(len(values) == 1 for values in global_refs.values()), "Shared Reference metadata conflict")
    for path in sorted((ROOT / "frontend/public/learning").rglob("*")):
        if not path.is_file():
            continue
        track(path)
        url = "/" + path.relative_to(ROOT / "frontend/public").as_posix()
        links = [c["contentKey"] for c in concepts if any(urlparse(f["url"]).path == url for f in c["figures"])]
        row = {"file": relative(path), "url": url, "sourceSha256": sha(path), "linkedConcepts": links,
               "deploymentEvidence": deployed_assets.get(url, {"status": "NEEDS_REVIEW"}),
               "visualReview": notes.get("assets", {}).get(url, {"status": "NEEDS_REVIEW"})}
        if path.suffix == ".svg":
            tree = ET.parse(path).getroot()
            row["viewBox"] = tree.get("viewBox")
            row["labels"] = ["".join(e.itertext()) for e in tree.iter() if e.tag.endswith("}text")]
        assets.append(row)
    all_keys = {i["contentKey"] for i in concepts + questions}
    expected_wave_keys = {i["contentKey"] for i in concepts + questions if i["area"] in WAVE_AREAS}
    require(set(wave_reviews) == expected_wave_keys, "Wave 1 complete Concept/Question key coverage")
    for item in concepts + questions:
        if item["contentKey"] in wave_reviews:
            require(wave_reviews[item["contentKey"]]["area"] == item["area"], f"Wave item area: {item['contentKey']}")
    wave_findings = [f for data in wave_ledgers.values() for f in data["findings"]]
    for area, ledger in wave_ledgers.items():
        require({t["key"] for t in ledger["topics"]} == {t["contentKey"] for t in topics if t["area"] == area},
                f"Wave 1 Topic key coverage: {area}")
        require(len({s[0] for s in ledger["sources"]}) == len(ledger["sources"]), f"Duplicate Wave source: {area}")
        require({r["url"] for r in references if r["area"] == area}.issubset({s[0] for s in ledger["sources"]}),
                f"Wave 1 Reference coverage: {area}")
    for finding in wave_findings:
        require(finding["severity"] in {"P0", "P1", "P2"}, f"Wave finding severity: {finding['id']}")
        require(set(finding["contentKeys"]).issubset(expected_wave_keys), f"Wave finding keys: {finding['id']}")
        # JSON string escapes represent literal newline evidence in the source pack.
        source = (ROOT / finding["file"]).read_text(encoding="utf-8")
        require(finding["quote"] in source or json.dumps(finding["quote"], ensure_ascii=False)[1:-1] in source,
                f"Wave quote not in source: {finding['id']}")
        require(bool(finding["problem"]) and bool(finding["action"]), f"Wave finding reasoning: {finding['id']}")
    require(set(notes["items"]).issubset(all_keys), "Unknown manual review key")
    finding_ids = [f["id"] for f in notes["findings"] + wave_findings]
    require(len(finding_ids) == len(set(finding_ids)), "Duplicate finding ID")
    for finding in notes["findings"]:
        require(finding["contentKey"] in all_keys, f"Unknown finding key: {finding['id']}")
        require(all(k in all_keys for k in finding.get("affectedKeys", [])), f"Unknown affected key: {finding['id']}")
        require(finding["severity"] in {"P0", "P1", "P2"}, f"Invalid severity: {finding['id']}")
        path = ROOT / finding["file"]
        for quote in finding.get("quotes", []):
            require(quote in path.read_text(encoding="utf-8"), f"Finding quote not in source: {finding['id']}")
    areas = []
    for area in sorted(previous_areas):
        cs = [c for c in concepts if c["area"] == area]
        qs = [q for q in questions if q["area"] == area]
        rs = [r for r in references if r["area"] == area]
        areas.append({"area": area, "topics": sum(t["area"] == area for t in topics), "concepts": len(cs),
                      "questions": len(qs), "questionTypes": counted(q["questionType"] for q in qs),
                      "difficulty": counted(q["difficulty"] for q in qs), "visualization": counted(c["visualization"] for c in cs),
                      "levelDistribution": counted(c["level"] for c in cs), "densityDistribution": counted(c["density"] for c in cs),
                      "figures": sum(c["actualFigureCount"] for c in cs), "referenceLinks": len(rs),
                      "uniqueReferenceUrls": len({r["url"] for r in rs}),
                      "conceptDecisions": counted(c["review"]["recommendation"] for c in cs),
                      "questionDecisions": counted(q["review"]["recommendation"] for q in qs),
                      "conceptEvidence": counted(c["review"]["evidenceLevel"] for c in cs),
                      "questionEvidence": counted(q["review"]["evidenceLevel"] for q in qs),
                      "semanticReviewStatus": "CURRENT_VERIFIED" if area in wave_ledgers else "NEEDS_REVIEW",
                      "areaVerdict": "NEEDS_REVIEW", "previousWave": {k: historical["areaWaves"][area][k] for k in ["number", "url", "title"]},
                      "semanticEvidence": notes.get("areas", {}).get(area, "새 전수 의미 검토 미완료; 이전 PASS를 취소하지 않는다.")})
        if area in wave_ledgers:
            areas[-1]["areaVerdict"] = "TARGETED_ENHANCE"
            areas[-1]["semanticEvidence"] = wave_ledgers[area]["reviewMethod"]
    require(len(areas) == 15, "Expected 15 LearningAreas")
    manifest = {"baselineSha": BASELINE, "files": dict(sorted(sources.items()))}
    # Verify tracked source bytes against the pinned baseline; no checkout/import/network writes.
    baseline_hashes = subprocess.run(["git", "ls-tree", "-r", BASELINE, "--", "content", "frontend/public/learning"],
                                    cwd=ROOT, check=True, capture_output=True, text=True).stdout
    git_objects = {line.split("\t", 1)[1]: line.split()[2] for line in baseline_hashes.splitlines()}
    actual_hashes = subprocess.run(["git", "hash-object", "--stdin-paths"], cwd=ROOT,
                                  input="\n".join(sources) + "\n", check=True,
                                  capture_output=True, text=True).stdout.splitlines()
    for name, actual in zip(sources, actual_hashes, strict=True):
        expected = git_objects.get(name)
        require(expected == actual, f"Canonical baseline bytes changed: {name}")
    delta = [{"area": a["area"], "before": previous_areas[a["area"]]["inventory"]["questionCount"],
              "now": a["questions"], "difference": a["questions"] - previous_areas[a["area"]]["inventory"]["questionCount"]} for a in areas]
    artifacts = {"inventory.json": {"baselineSha": BASELINE, "topics": topics, "concepts": concepts},
                 "question-inventory.json": {"baselineSha": BASELINE, "questions": [
                     {**{k: q[k] for k in ["area", "file", "arrayIndex", "contentKey", "questionType", "difficulty", "status", "conceptKeys", "promptMarkdown", "sourceSha256", "review"]},
                      "answerShape": {"correctChoiceKey": q.get("correctChoiceKey"), "choiceCount": len(q.get("choices", [])),
                                      "acceptedAnswerCount": len(q.get("acceptedAnswers", [])), "modelAnswerPresent": bool(q.get("modelAnswer")),
                                      "explanationPresent": bool(q.get("explanationMarkdown"))}} for q in questions]},
                 "reference-inventory.json": {"uniqueUrls": len(global_refs), "links": references},
                 "asset-inventory.json": assets, "candidates.json": candidates, "area-summary.json": areas,
                 "source-manifest.json": manifest, "prior-delta.json": {"questionCounts": delta, "findings": notes["priorFindings"]},
                 "wave-1-summary.json": summarize_wave(wave_ledgers, concepts, questions),
                 "wave-1-findings.json": wave_findings}
    lines = ["# LearningArea별 감사 요약", "", "15 Area 전수 구조 인벤토리를 유지한다. Wave 1의 6 Area는 본문/문항 전수 직접 검토 CURRENT_VERIFIED, 나머지 9 Area는 새 전수 의미 검토 NEEDS_REVIEW다. 과거 PASS는 PRIOR_REVIEWED 근거로 보존한다.", "",
             "| Area | Topic | Concept | Question | 이번 본문 검토 | 이번 문항 검토 | Concept KEEP / ENHANCE / REVIEW |", "| --- | ---: | ---: | ---: | ---: | ---: | --- |"]
    for area in areas:
        name = area["area"]
        body_reviews = sum(c["area"] == name and c["review"]["evidenceLevel"] != "NEEDS_REVIEW" for c in concepts)
        question_reviews = sum(q["area"] == name and q["review"]["evidenceLevel"] != "NEEDS_REVIEW" for q in questions)
        counts = area["conceptDecisions"]
        lines.append(f"| {name} | {area['topics']} | {area['concepts']} | {area['questions']} | {body_reviews} | {question_reviews} | {counts.get('KEEP', 0)} / {counts.get('TARGETED_ENHANCE', 0)} / {counts.get('NEEDS_REVIEW', 0)} |")
    lines.extend(["", "검토 수에는 이전 초기 샘플 CURRENT_PARTIAL도 포함한다. 전수 완료 수는 wave-1-summary.json의 CURRENT_VERIFIED 수로 구별한다. 근거는 review-notes.json 및 wave-1/*.json, 위치/연결은 inventory.json에 있다.", ""])
    for area in areas:
        lines.extend([f"## {area['area']}", "", area["semanticEvidence"], "", f"이전 전수 Wave: [PR #{area['previousWave']['number']}]({area['previousWave']['url']}) (PRIOR_REVIEWED). 새 근거: **{area['semanticReviewStatus']}**. 품질: **{area['areaVerdict']}**.", ""])
    artifacts["area-summary.md"] = "\n".join(lines)
    if errors:
        print(json.dumps({"errors": errors}, ensure_ascii=False, indent=2))
        return 1
    drift = []
    for name, data in artifacts.items():
        if name in {"inventory.json", "question-inventory.json", "reference-inventory.json"}:
            encoded = encode_inventory(data)
        else:
            encoded = data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        path = OUT / name
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != encoded:
                drift.append(name)
        else:
            path.write_text(encoded, encoding="utf-8", newline="\n")
    if drift:
        print("Generated output drift: " + ", ".join(drift))
        return 1
    print(json.dumps({"areas": len(areas), "topics": len(topics), "concepts": len(concepts), "questions": len(questions),
                      "referenceLinks": len(references), "uniqueReferenceUrls": len(global_refs), "assets": len(assets),
                      "unconfirmedCandidates": len(candidates), "errors": 0, "mode": "check" if args.check else "generate"}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
