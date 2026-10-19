"""Validate the exact #247/#248 proposal without merging or editing canonical files.

Run on a checkout whose content equals BASE. Requires the two Git objects and
PyYAML. Source access claims come from the PR evidence, not this offline check.
The optional ledger output is a proposal for conflict resolution, not main's ledger.
"""
import argparse
import copy
import hashlib
import json
import subprocess
import tempfile
import types
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[3]
BASE = "e0dbadfbf0691e079b8d2e20d623aceb8bad5103"
UMD = "5689629532e11722b668c12dd5c58073e6e8d809"
CAP = "6f0895b82467f4dd81e5a348a329379bcb3e0da2"
AUDIT = "docs/content-corrections/issue-222-r2/"
LEDGER = AUDIT + "verified-relations.json"


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode("utf-8")


def blob(commit, path):
    return git("show", commit + ":" + path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--ledger-out", type=Path)
    args = parser.parse_args()
    assert not git("diff", BASE, "--name-only", "--", "content").strip(), "Run on BASE canonical content"
    baseline = json.loads(blob(BASE, LEDGER))
    umd = json.loads(blob(UMD, LEDGER))
    cap = json.loads(blob(CAP, LEDGER))
    assert len(baseline) == 103 and umd[:103] == cap[:103] == baseline
    assert len(umd) == 147 and len(cap) == 104
    ledger = baseline + umd[103:] + cap[103:]
    assert len({(r["contentKey"], r["url"]) for r in ledger}) == 148
    overlay = {}
    for commit, expected in [(UMD, 44), (CAP, 1)]:
        paths = git("diff", BASE, commit, "--name-only", "--", "content").splitlines()
        assert len(paths) == expected and all(p.endswith(".md") for p in paths)
        for path in paths:
            before, after = blob(BASE, path), blob(commit, path)
            assert before.split("---", 2)[2] == after.split("---", 2)[2], path
            old, new = [yaml.safe_load(s.split("---", 2)[1]) for s in [before, after]]
            old.pop("references")
            new.pop("references")
            assert old == new and path not in overlay, path
            overlay[path] = after

    # Combine the two independently reviewed guards in memory only. Supplements
    # still require the flagged original URL; replacements require its retirement.
    source = blob(UMD, AUDIT + "reconcile.py")
    marker = '        if not live["evidenceFlags"]:\n'
    assert source.count(marker) == 1
    source = source.replace(marker, '''        if not live["evidenceFlags"] and record.get("supplementsUrl"):
            supported = by_key_url.get((record["contentKey"], record["supplementsUrl"]))
            assert supported and supported["evidenceFlags"], identity
            assert (ROOT / record["evidenceDocument"]).is_file(), identity
        elif not live["evidenceFlags"]:
''')
    module = types.ModuleType("r2_projected_reconcile")
    module.__file__ = str(ROOT / (AUDIT + "reconcile.py"))
    exec(compile(source, module.__file__, "exec"), module.__dict__)
    original_parse, original_load = module.parse_frontmatter, module.load_json

    def projected_frontmatter(path):
        text = overlay.get(path.relative_to(ROOT).as_posix())
        return yaml.safe_load(text.split("---", 2)[1]) if text else original_parse(path)

    module.parse_frontmatter = projected_frontmatter
    documents = {}
    with tempfile.TemporaryDirectory(prefix="csforge-r2-evidence-") as temporary:
        runtime_ledger = copy.deepcopy(ledger)
        for record in runtime_ledger[103:]:
            path = record["evidenceDocument"]
            commit = UMD if record.get("replacesUrl") else CAP
            evidence = blob(commit, path)
            target = Path(temporary) / Path(path).name
            target.write_text(evidence, encoding="utf-8")
            record["evidenceDocument"] = str(target)
            documents[path] = {"commit": commit, "sha256": hashlib.sha256(evidence.encode()).hexdigest()}
        module.load_json = lambda path: runtime_ledger if path == ROOT / LEDGER else original_load(path)
        result = module.reconcile()
    pending = [r for r in result["currentRelations"] if r["area"] != "java"
               and r["evidenceFlags"] and not r.get("r2ManualResolution")]
    assert len(pending) == 1 and pending[0]["url"] == "https://dl.acm.org/doi/10.1145/564585.564601"
    assert result["r2ManualVerifiedRelations"] == 148
    assert result["canonical"]["relations"] == 1038 and result["canonical"]["uniqueUrls"] == 628
    encoded_ledger = json.dumps(ledger, ensure_ascii=False, indent=2) + "\n"
    report = {
        "kind": "UNMERGED_PROPOSAL_NOT_MAIN_STATE", "base": BASE, "umdHead": UMD, "capHead": CAP,
        "baselineVerifiedPreserved": 103, "directVerifiedAdded": 45,
        "umdUrlReplacements": 39, "umdConsolidationsIntoExistingReferences": 5,
        "capManuscriptAdded": 1, "learningGoalsWithReadableEvidence": 45,
        "canonical": result["canonical"], "proposedVerifiedRelations": 148,
        "originalContentAccessPending": pending, "evidenceDocuments": documents,
        "proposedLedgerSha256": hashlib.sha256(encoded_ledger.encode()).hexdigest(),
        "decision": "Readable learning relations secured; ACM publication full-text comparison and approval remain",
    }
    if args.out:
        args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.ledger_out:
        args.ledger_out.write_text(encoded_ledger, encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k not in ("originalContentAccessPending", "evidenceDocuments")},
                     ensure_ascii=False, sort_keys=True))


if __name__ == "__main__":
    main()
