"""Validate and index handwritten Wave 1 evidence; never infer a quality verdict."""

from collections import Counter


WAVE_AREAS = {
    "cache", "messaging-async", "infrastructure-cloud",
    "performance-observability-operations", "distributed-systems", "system-design",
}
CONCEPT_AXES = [
    "objectiveLevelDepth", "accuracyMechanismCodeExamplesClarityBoundaries",
    "visualization", "references", "linkedQuestionCoverage",
]
QUESTION_AXES = ["answerChoicesRationalesModelExplanation", "ambiguityDifficultyDuplication"]


def load_wave(out, root, baseline, read_json, sha, require):
    """A stale or incomplete ledger fails validation instead of receiving KEEP."""
    reviews, sources, ledgers = {}, {}, {}
    paths = sorted((out / "wave-1").glob("*.json"))
    require({p.stem for p in paths} == WAVE_AREAS, "Wave 1 area file coverage")
    for path in paths:
        data = read_json(path)
        area = data["area"]
        ledgers[area] = data
        require(area == path.stem and data["baselineSha"] == baseline, f"Wave baseline/area: {area}")
        require(bool(data["reviewMethod"]), f"Wave review method: {area}")
        require(len(data["topics"]) == 3, f"Wave Topic count: {area}")
        require(all(t.get("coverage") for t in data["topics"]), f"Wave Topic reasoning: {area}")
        require(sha(root / "content/curriculum" / (area + ".yaml")) == data["curriculumSha256"],
                f"Stale Wave curriculum: {area}")
        require(sha(root / "content" / area / "topics.json") == data["topicCatalogSha256"],
                f"Stale Wave Topic catalog: {area}")
        for kind, axes, count in [("concepts", CONCEPT_AXES, 9), ("questions", QUESTION_AXES, 27)]:
            rows = data[kind]
            require(len(rows) == count, f"Wave {kind} count: {area}")
            for row in rows:
                key, verdict, *basis = row
                require(key not in reviews, f"Duplicate Wave review key: {key}")
                require(len(basis) == len(axes) and all(isinstance(b, str) and b.strip() for b in basis),
                        f"Incomplete handwritten reasoning: {key}")
                require(verdict in {"KEEP", "TARGETED_ENHANCE", "REWRITE_REQUIRED", "NEEDS_REVIEW"},
                        f"Invalid Wave quality decision: {key}")
                findings = [f for f in data["findings"] if key in f["contentKeys"]]
                require(verdict not in {"TARGETED_ENHANCE", "REWRITE_REQUIRED"} or bool(findings),
                        f"Quality change without an actionable finding: {key}")
                require(not findings or verdict in {"TARGETED_ENHANCE", "REWRITE_REQUIRED"},
                        f"Finding contradicts handwritten quality decision: {key}")
                reviews[key] = {
                    "recommendation": verdict, "qualityDecision": verdict,
                    "evidenceLevel": "CURRENT_VERIFIED", "reviewScope": "COMPLETE_CANONICAL_ITEM_WAVE_1",
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
    return reviews, sources, ledgers


def summarize_wave(ledgers, concepts, questions):
    rows = []
    for area in sorted(ledgers):
        cs = [c for c in concepts if c["area"] == area]
        qs = [q for q in questions if q["area"] == area]
        rows.append({"area": area, "concepts": len(cs), "questions": len(qs),
                     "currentVerifiedConcepts": sum(c["review"]["evidenceLevel"] == "CURRENT_VERIFIED" for c in cs),
                     "currentVerifiedQuestions": sum(q["review"]["evidenceLevel"] == "CURRENT_VERIFIED" for q in qs),
                     "conceptQuality": dict(sorted(Counter(c["review"]["recommendation"] for c in cs).items())),
                     "questionQuality": dict(sorted(Counter(q["review"]["recommendation"] for q in qs).items()))})
    return {"baselineSha": next(iter(ledgers.values()))["baselineSha"], "wave": "Wave 1", "areas": rows,
            "allConceptQuality": dict(sorted(Counter(c["review"]["recommendation"] for c in concepts).items())),
            "allQuestionQuality": dict(sorted(Counter(q["review"]["recommendation"] for q in questions).items())),
            "allConceptEvidence": dict(sorted(Counter(c["review"]["evidenceLevel"] for c in concepts).items())),
            "allQuestionEvidence": dict(sorted(Counter(q["review"]["evidenceLevel"] for q in questions).items()))}
