"""Validate and index handwritten wave evidence; never infer a quality verdict."""

from collections import Counter


WAVE_AREAS = {
    "cache", "messaging-async", "infrastructure-cloud",
    "performance-observability-operations", "distributed-systems", "system-design",
}
WAVE_2_COUNTS = {
    "spring": (12, 37, 77), "database": (12, 38, 75),
    "backend-engineering": (13, 40, 108), "security": (12, 38, 74),
}
WAVE_3_COUNTS = {
    "computer-architecture": (10, 61, 183), "dsa": (12, 84, 293),
    "operating-systems": (12, 97, 331), "network-http": (15, 127, 381),
}
WAVE_4_TOPICS = {"java--language-types": (1, 10, 55)}
CONCEPT_AXES = [
    "objectiveLevelDepth", "accuracyMechanismCodeExamplesClarityBoundaries",
    "visualization", "references", "linkedQuestionCoverage",
]
QUESTION_AXES = ["answerChoicesRationalesModelExplanation", "ambiguityDifficultyDuplication"]


def load_wave(out, root, baseline, read_json, sha, require, wave=1):
    """A stale or incomplete ledger fails validation instead of receiving KEEP."""
    reviews, sources, ledgers = {}, {}, {}
    counts = {1: {a: (3, 9, 27) for a in WAVE_AREAS},
              2: WAVE_2_COUNTS, 3: WAVE_3_COUNTS, 4: WAVE_4_TOPICS}[wave]
    folder = out / f"wave-{wave}"
    paths = sorted((folder / "topics" if wave == 4 else folder).glob("*.json"))
    require({p.stem for p in paths} == set(counts), f"Wave {wave} area file coverage")
    for path in paths:
        data = read_json(path)
        area = data["area"]
        ledgers[area] = data
        require((wave == 4 and path.stem == area + "--" + data["topic"] or area == path.stem)
                and data["baselineSha"] == baseline, f"Wave baseline/area: {area}")
        require(bool(data["reviewMethod"]), f"Wave review method: {area}")
        topic_count, concept_count, question_count = counts.get(path.stem, (0, 0, 0))
        require(len(data["topics"]) == topic_count, f"Wave Topic count: {area}")
        require(all(t.get("coverage") for t in data["topics"]), f"Wave Topic reasoning: {area}")
        require(sha(root / "content/curriculum" / (area + ".yaml")) == data["curriculumSha256"],
                f"Stale Wave curriculum: {area}")
        require(sha(root / "content" / area / "topics.json") == data["topicCatalogSha256"],
                f"Stale Wave Topic catalog: {area}")
        for kind, axes, count in [("concepts", CONCEPT_AXES, concept_count),
                                  ("questions", QUESTION_AXES, question_count)]:
            rows = data[kind]
            require(len(rows) == count, f"Wave {kind} count: {area}")
            for row in rows:
                key, verdict, *basis = row
                require(key not in reviews, f"Duplicate Wave review key: {key}")
                require(len(basis) == len(axes) and all(isinstance(b, str) and b.strip() for b in basis),
                        f"Incomplete handwritten reasoning: {key}")
                require(verdict in {"KEEP", "TARGETED_ENHANCE", "REWRITE_REQUIRED", "NEEDS_REVIEW"},
                        f"Invalid Wave quality decision: {key}")
                findings = [f for f in data["findings"] + data.get("carriedForwardFindings", [])
                            if key in f["contentKeys"]]
                require(verdict not in {"TARGETED_ENHANCE", "REWRITE_REQUIRED"} or bool(findings),
                        f"Quality change without an actionable finding: {key}")
                require(not findings or verdict in {"TARGETED_ENHANCE", "REWRITE_REQUIRED"},
                        f"Finding contradicts handwritten quality decision: {key}")
                reviews[key] = {
                    "recommendation": verdict, "qualityDecision": verdict,
                    "evidenceLevel": "CURRENT_VERIFIED", "reviewScope": f"COMPLETE_CANONICAL_ITEM_WAVE_{wave}",
                    "area": area, "sourceSha256": data["sourceHashes"].get(key),
                    "basis": dict(zip(axes, basis, strict=True)),
                    "evidenceFile": path.relative_to(root).as_posix(),
                    "findingIds": [f["id"] for f in findings],
                    "severity": min((f["severity"] for f in findings), default=None),
                }
        require(set(data["sourceHashes"]) == {r[0] for r in data["concepts"] + data["questions"]},
                f"Wave source hash key coverage: {area}")
        for url, evidence, basis in data["sources"]:
            require(evidence in {"CURRENT_VERIFIED", "NEEDS_REVIEW"} and bool(basis), f"Wave source evidence: {url}")
            entry = {"evidenceLevel": evidence, "basis": basis, "area": area,
                     "evidenceFile": path.relative_to(root).as_posix()}
            sources.setdefault(url, []).append(entry)
        supplemental = data.get("supplementalSources", [])
        require(len({s[0] for s in supplemental}) == len(supplemental), f"Duplicate supplemental source: {area}")
        for url, evidence, basis in supplemental:
            require(evidence in {"CURRENT_VERIFIED", "NEEDS_REVIEW"} and bool(basis),
                    f"Supplemental source evidence: {url}")
        for url, access in data.get("referenceAccess", {}).items():
            require(url in {s[0] for s in data["sources"]}, f"Access note without source: {url}")
            require(access.get("status") in {"CURRENT_VERIFIED", "NEEDS_REVIEW"} and bool(access.get("basis")),
                    f"Reference access evidence: {url}")
        for asset in data.get("visualizationAssets", []):
            require(asset.get("reviewScope") == "COMPLETE_SVG_SOURCE_SEMANTIC_GEOMETRY; NO_RENDER_QA",
                    f"Wave asset review scope: {asset.get('file')}")
            require(sha(root / asset["file"]) == asset["sourceSha256"],
                    f"Stale Wave asset evidence: {asset['file']}")
        require(len({a["file"] for a in data.get("visualizationAssets", [])}) ==
                len(data.get("visualizationAssets", [])), f"Duplicate Wave asset: {area}")
        checked_urls = {s[0] for s in data["sources"] + supplemental if s[1] == "CURRENT_VERIFIED"}
        concept_keys = {r[0] for r in data["concepts"]}
        for key, support in data.get("supportingEvidence", {}).items():
            require(key in concept_keys and support.get("kind") in {"CHECKED_SOURCE", "DIRECT_DERIVATION"}
                    and bool(support.get("basis")), f"Concept supporting evidence: {key}")
            require(set(support.get("urls", [])).issubset(checked_urls), f"Unverified supporting URL: {key}")
            require(support["kind"] != "CHECKED_SOURCE" or bool(support.get("urls")),
                    f"Missing checked supporting URL: {key}")
            if key in reviews:
                reviews[key]["supportingEvidence"] = support
        if wave == 4:
            probe = data["probeEvidence"]
            require(sha(root / probe["file"]) == probe["sourceSha256"] and probe["exitCode"] == 0
                    and bool(probe["stdout"]) and bool(probe["limits"]), "Stale/incomplete Wave 4 probe evidence")
    return reviews, sources, ledgers


def summarize_wave(ledgers, concepts, questions, wave=1):
    rows = []
    for area in sorted(ledgers):
        scope = {r[0] for r in ledgers[area]["concepts"] + ledgers[area]["questions"]}
        cs = [c for c in concepts if c["area"] == area and (wave != 4 or c["contentKey"] in scope)]
        qs = [q for q in questions if q["area"] == area and (wave != 4 or q["contentKey"] in scope)]
        rows.append({"area": area, "concepts": len(cs), "questions": len(qs),
                     "currentVerifiedConcepts": sum(c["review"]["evidenceLevel"] == "CURRENT_VERIFIED" for c in cs),
                     "currentVerifiedQuestions": sum(q["review"]["evidenceLevel"] == "CURRENT_VERIFIED" for q in qs),
                     "conceptQuality": dict(sorted(Counter(c["review"]["recommendation"] for c in cs).items())),
                     "questionQuality": dict(sorted(Counter(q["review"]["recommendation"] for q in qs).items()))})
    return {"baselineSha": next(iter(ledgers.values()))["baselineSha"], "wave": f"Wave {wave}", "areas": rows,
            "allConceptQuality": dict(sorted(Counter(c["review"]["recommendation"] for c in concepts).items())),
            "allQuestionQuality": dict(sorted(Counter(q["review"]["recommendation"] for q in questions).items())),
            "allConceptEvidence": dict(sorted(Counter(c["review"]["evidenceLevel"] for c in concepts).items())),
            "allQuestionEvidence": dict(sorted(Counter(q["review"]["evidenceLevel"] for q in questions).items()))}
