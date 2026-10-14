"""Check real two-Topic accumulation and rejection of conflicting/stale evidence."""

import copy
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys
import subprocess
import unittest

sys.dont_write_bytecode = True
BASE = Path(__file__).resolve().parent.parent
ROOT = BASE.parents[2]
sys.path.insert(0, str(BASE))
from wave_review import load_wave, scoped_sources


def sha(path):
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


class AccumulationChecks(unittest.TestCase):
    def setUp(self):
        self.parts = {p.stem: json.loads(p.read_text(encoding="utf-8"))
                      for p in (BASE / "wave-4/topics").glob("*.json")}

    def load(self, parts=None):
        fixtures = copy.deepcopy(parts or self.parts)
        errors = []
        reviews, sources, ledgers = load_wave(
            BASE, ROOT, "efe73a15da14c996bd08344181d4d6f87073803d",
            lambda p: fixtures[p.stem], sha,
            lambda ok, message: errors.append(message) if not ok else None, wave=4)
        return reviews, sources, ledgers, errors

    def test_both_topics_and_first_evidence_survive(self):
        reviews, sources, ledgers, errors = self.load()
        self.assertEqual(errors, [])
        self.assertEqual(len(reviews), 145)
        area = ledgers["java"]
        self.assertEqual((len(area["topics"]), len(area["concepts"]), len(area["questions"])), (2, 22, 123))
        first = self.parts["java--language-types"]
        self.assertEqual(area["topicLedgers"][first["topicKey"]], first)
        for field in ("findings", "carriedForwardFindings", "visualizationAssets"):
            for item in first[field]:
                self.assertIn(item, area[field])
        self.assertEqual(len(sources["https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"]), 2)

    def test_shared_url_status_cannot_cross_topic(self):
        url = "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
        parts = copy.deepcopy(self.parts)
        entry = next(s for s in parts["java--object-model"]["sources"] if s[0] == url)
        entry[1] = "NEEDS_REVIEW"  # Synthetic fixture, never writes a ledger.
        _, sources, _, errors = self.load(parts)
        self.assertEqual(errors, [])
        first = scoped_sources(sources, url, "java", "java.core.language-types.final-reference-and-immutability")
        second = scoped_sources(sources, url, "java", "java.core.object-model.static-vs-instance-members")
        self.assertEqual([s["evidenceLevel"] for s in first], ["CURRENT_VERIFIED"])
        self.assertEqual([s["evidenceLevel"] for s in second], ["NEEDS_REVIEW"])
        self.assertEqual(scoped_sources(sources, url, "java", "java.core.enum-modeling.enum-basics"), [])

    def test_previous_single_topic_snapshot_is_preserved(self):
        first = self.parts["java--language-types"]
        path = BASE / "wave-4/topics/java--language-types.json"
        prior_bytes = subprocess.check_output([
            "git", "show", "393d098c1e3f16ccc80a5fc9fdf2c6848a1fd98b:" + path.relative_to(ROOT).as_posix()], cwd=ROOT)
        self.assertEqual(path.read_bytes().replace(b"\r\n", b"\n"), prior_bytes)
        snapshot = json.loads((BASE / "wave-4/snapshots/language-types-summary.json").read_text(encoding="utf-8"))
        row = snapshot["areas"][0]
        self.assertEqual((row["concepts"], row["questions"]), (len(first["concepts"]), len(first["questions"])))
        self.assertEqual(row["conceptQuality"], dict(Counter(r[1] for r in first["concepts"])))
        self.assertEqual(row["questionQuality"], dict(Counter(r[1] for r in first["questions"])))

    def test_duplicate_key_is_rejected(self):
        parts = copy.deepcopy(self.parts)
        parts["java--object-model"]["concepts"][0][0] = parts["java--language-types"]["concepts"][0][0]
        errors = self.load(parts)[3]
        self.assertTrue(any("Duplicate Wave review key" in e for e in errors))

    def test_missing_row_is_rejected(self):
        parts = copy.deepcopy(self.parts)
        parts["java--object-model"]["questions"].pop()
        errors = self.load(parts)[3]
        self.assertTrue(any("Wave questions count" in e for e in errors))

    def test_stale_curriculum_or_svg_pin_is_rejected(self):
        parts = copy.deepcopy(self.parts)
        first = parts["java--language-types"]
        first["curriculumSha256"] = "0" * 64
        first["visualizationAssets"][0]["sourceSha256"] = "0" * 64
        errors = self.load(parts)[3]
        self.assertTrue(any("Stale Wave curriculum" in e for e in errors))
        self.assertTrue(any("Stale Wave asset" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
