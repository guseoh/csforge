"""Read-only coverage checks for the #277 audit snapshot (Python standard library).

This is an audit utility, not an application Markdown/YAML parser. It accepts the
current canonical single-line metadata and unindented fences, failing on drift.
Semantic decisions and block purposes are reviewed evidence, never inferred here.
"""

from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
AREAS = ("java", "network-http")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"Duplicate JSON property: {key}")
        result[key] = value
    return result


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_object)


def sha(path):
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def scalar(text, key):
    values = re.findall(r"^" + re.escape(key) + r": (.+)$", text, re.M)
    require(len(values) == 1, f"Missing/duplicate scalar: {key}")
    value = values[0].strip()
    if value.startswith('"'):
        return json.loads(value)
    return int(value) if value.isdigit() else value


def curriculum_concepts(path):
    # Read just the approved key/title/level/objective/visualization scalar subset.
    concepts = {}
    topic = None
    current = None
    for line in path.read_text(encoding="utf-8").splitlines():
        match = re.fullmatch(r"\s*- key: (\S+)\s*", line)
        if match:
            key = match[1]
            if key.count(".") == 2:
                topic, current = key, None
            elif key.count(".") == 3:
                require(key not in concepts, f"Duplicate curriculum key: {key}")
                current = {"topicContentKey": topic}
                concepts[key] = current
        elif current is not None:
            match = re.fullmatch(r"\s+(title|level|objective|visualization): (.+)", line)
            if match:
                key, value = match.groups()
                require(key not in current, f"Duplicate curriculum scalar: {key}")
                require(value not in ("|", ">", "|-", ">-"), "Revisit multiline metadata reader")
                current[key] = json.loads(value) if value.startswith('"') else int(value) if value.isdigit() else value
    return concepts


def fences(text):
    # Current canonical files use only top-level fences. Containers require review.
    result = []
    opened = None
    for number, line in enumerate(text.splitlines(), 1):
        if opened:
            marker = opened["marker"]
            if re.fullmatch(re.escape(marker[0]) + "{" + str(len(marker)) + r",}\s*", line):
                result.append(opened)
                opened = None
            else:
                opened["text"] += line + "\n"
        else:
            match = re.fullmatch(r"(`{3,}|~{3,})(.*)", line)
            if match:
                opened = {"index": len(result), "line": number, "marker": match[1], "language": match[2].strip(), "text": ""}
            require(not re.match(r"^(?: +|> ?|[-+*] )[`~]{3}", line), "Revisit container fence inventory")
    require(opened is None, "Unclosed canonical fence")
    return result


def image_paths(body):
    # Non-greedy ALT allows nested [] such as Object[]; no flat-ALT assumption.
    return re.findall(r"!\[.*?\]\(([^)]+)\)", body)


def validate():
    baseline = read_json(OUT / "baseline.json")
    for path, expected in baseline["sources"].items():
        require(sha(ROOT / path) == expected, f"Baseline drift: {path}")
    all_rows = []
    for area in AREAS:
        document = read_json(OUT / f"{area}.json")
        require(document["baseline"] == baseline["head"], "Baseline mismatch")
        rows = document["concepts"]
        keys = [row["contentKey"] for row in rows]
        require(len(keys) == len(set(keys)), f"Duplicate manifest keys: {area}")
        paths = [row["sourcePath"] for row in rows]
        require(len(paths) == len(set(paths)), f"Duplicate manifest paths: {area}")
        curriculum = curriculum_concepts(ROOT / f"content/curriculum/{area}.yaml")
        canonical = {}
        for path in (ROOT / "content" / area).rglob("*.md"):
            text = path.read_text(encoding="utf-8")
            _, front, body = text.split("---", 2)
            require(scalar(front, "kind") == "concept", f"Unexpected Markdown kind: {path}")
            key = scalar(front, "contentKey")
            require(key not in canonical, f"Duplicate canonical key: {key}")
            canonical[key] = (path, front, body, text)
        require(set(keys) == set(canonical) == set(curriculum), f"Coverage mismatch: {area}")
        topic_keys = [t["contentKey"] for t in read_json(ROOT / f"content/{area}/topics.json")]
        require(len(topic_keys) == len(set(topic_keys)), f"Duplicate topics: {area}")
        require(set(topic_keys) == {c["topicContentKey"] for c in curriculum.values()}, f"Curriculum topic mismatch: {area}")
        for row in rows:
            key = row["contentKey"]
            path, front, body, text = canonical[key]
            require(row["area"] == area, f"Area mismatch: {key}")
            require(row["sourcePath"] == path.relative_to(ROOT).as_posix(), f"Path mismatch: {key}")
            require(row["sourceSha256"] == sha(path), f"Concept changed since review: {key}")
            for name in ("topicContentKey", "level"):
                require(row[name] == scalar(front, name) == curriculum[key][name], f"Metadata mismatch {name}: {key}")
            require(row["title"] == scalar(front, "title"), f"Canonical title mismatch: {key}")
            if row["title"] != curriculum[key]["title"]:
                require(baseline["knownTitleDifferences"].get(key) == {"canonical": row["title"], "curriculum": curriculum[key]["title"]}, f"Unrecorded title difference: {key}")
            require(row["objective"] == curriculum[key]["objective"], f"Objective mismatch: {key}")
            require(row["curriculumVisualization"] == curriculum[key].get("visualization", "NONE"), f"Curriculum visual mismatch: {key}")
            need, tier = row["visualizationNeed"], row["targetTier"]
            require(need in {"NONE", "RECOMMENDED", "REQUIRED"}, f"Invalid need: {key}")
            require(tier in {"NONE", "V1", "V2", "V3", "V4"}, f"Invalid tier: {key}")
            require((need == "NONE") == (tier == "NONE"), f"Need/tier mismatch: {key}")
            require(row["changeDecision"] in {"KEEP", "RESTYLE", "REBUILD", "REPLACE_TEXT", "CREATE", "NONE"}, f"Invalid decision: {key}")
            require(row["priority"] in {"P0", "P1", "P2"}, f"Invalid priority: {key}")
            for name in ("learningQuestion", "depictedState", "interaction", "reason", "reuseCandidate", "targetAssetOrComponent", "accuracyValidation", "implementationPackage"):
                require(bool(row[name]), f"Missing {name}: {key}")
            refs = row["sourceAndGuarantee"]["references"]
            require(bool(refs) and all(url in front for url in refs), f"Invalid source evidence: {key}")
            media = row["existingMedia"]
            require([m["path"] for m in media["images"]] == image_paths(body), f"Image omissions: {key}")
            for m in media["images"]:
                require(m["path"].startswith("/learning/"), f"Review nonlocal media: {key}")
                require((ROOT / "frontend/public" / m["path"].lstrip("/").split("?")[0]).is_file(), f"Broken image: {key}")
            actual_blocks = fences(text)
            require(len(media["fencedBlocks"]) == len(actual_blocks), f"Fence omissions: {key}")
            for b, actual in zip(media["fencedBlocks"], actual_blocks):
                for name in ("index", "line", "language"):
                    require(b[name] == actual[name], f"Block {name} mismatch: {key}")
                require(b["sha256"] == hashlib.sha256(actual["text"].encode()).hexdigest(), f"Block evidence drift: {key}")
                require(b["purpose"] in {"structure", "text-specimen", "declarative", "code"}, f"Unclassified block: {key}")
                if b["purpose"] == "structure":
                    require(b["decision"] == "REPLACE_TEXT", f"ASCII approved as final diagram: {key}")
                else:
                    require(b["decision"] == "KEEP", f"Code/data/PoC not preserved: {key}")
            declarations = [json.loads(b["text"])["type"] for b in actual_blocks if b["language"] == "csforge-viz"]
            require(media["declarations"] == declarations, f"Declaration mismatch: {key}")
        print(area, len(rows), dict(Counter(r["visualizationNeed"] for r in rows)), dict(Counter(r["targetTier"] for r in rows)))
        all_rows.extend(rows)

    document = read_json(OUT / "java-svg.json")
    assets = document["assets"]
    paths = [a["path"] for a in assets]
    require(len(paths) == len(set(paths)), "Duplicate SVG inventory paths")
    actual_paths = {p.relative_to(ROOT).as_posix() for p in (ROOT / "frontend/public/learning/java").rglob("*.svg")}
    require(set(paths) == actual_paths, "SVG omissions")
    require(len({a["sha256"] for a in assets}) == len(assets), "Duplicate SVG bytes: review duplicateOf")
    for asset in assets:
        path = ROOT / asset["path"]
        require(sha(path) == asset["sha256"], f"SVG drift: {path}")
        tree = ET.parse(path)
        require(tree.getroot().get("viewBox") == asset["viewBox"], f"SVG dimensions: {path}")
        url = "/learning/java/" + path.name
        uses = [r["sourcePath"] for r in all_rows if any(m["path"].split("?")[0] == url for m in r["existingMedia"]["images"])]
        require(uses == asset["canonicalUses"], f"SVG usage mismatch: {path}")
        other = subprocess.run(["git", "grep", "-l", "-F", url, "--", "frontend/src", "content"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", check=False)
        require(other.returncode in (0, 1), f"git grep failed: {other.stderr}")
        require([p for p in other.stdout.splitlines() if p not in uses] == asset["otherSourceUses"], f"Other SVG uses: {path}")
        require(asset["changeDecision"] in {"KEEP", "RESTYLE", "REBUILD"}, f"Missing SVG decision: {path}")
    for area, field in (("network-http", "networkSvgCount"), ("operating-systems", "excludedOsSvgCount")):
        require(len(list((ROOT / f"frontend/public/learning/{area}").rglob("*.svg"))) == document[field], f"SVG scope count: {area}")
    packages = read_json(OUT / "packages.json")
    ids = [p["id"] for p in packages]
    require(len(ids) == len(set(ids)), "Duplicate implementation packages")
    require(set(ids) == {r["implementationPackage"] for r in all_rows}, "Package omissions")
    for package in packages:
        require(all(dep == "S0" or dep in ids for dep in package["dependsOn"]), "Unknown package dependency")
        require(package["id"] not in package["dependsOn"], "Self-dependent package")
        rs = [r for r in all_rows if r["implementationPackage"] == package["id"]]
        require({r["topicContentKey"] for r in rs} == {package["topicContentKey"]}, "Package topic mismatch")
        require(len(rs) == package["conceptCount"], "Package count mismatch")
        require(package["tiers"] == {tier: sum(r["targetTier"] == tier for r in rs) for tier in ("NONE", "V1", "V2", "V3", "V4")}, "Package tier counts")
        for need in ("REQUIRED", "RECOMMENDED", "NONE"):
            require(package[need.lower()] == sum(r["visualizationNeed"] == need for r in rs), "Package need counts")
        require(package["structureBlocksToReplace"] == sum(b["purpose"] == "structure" for r in rs for b in r["existingMedia"]["fencedBlocks"]), "Package text scope")
        require(package["svgUseCount"] == sum(len(r["existingMedia"]["images"]) for r in rs), "Package SVG scope")
    remaining = {p["id"]: set(p["dependsOn"]) - {"S0"} for p in packages}
    while remaining:
        ready = {key for key, deps in remaining.items() if not deps}
        require(bool(ready), "Cyclic package dependencies")
        remaining = {key: deps - ready for key, deps in remaining.items() if key not in ready}
    protected = subprocess.run(["git", "diff", "--name-only", baseline["head"], "--", "content", "frontend", "backend"], cwd=ROOT, capture_output=True, text=True, check=True)
    require(not protected.stdout.strip(), f"Audit-only scope violated: {protected.stdout}")
    print(f"PASS: {len(all_rows)} concepts, {len(assets)} SVGs, {len(packages)} topic packages; canonical/runtime unchanged")


if __name__ == "__main__":
    validate()
