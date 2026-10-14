"""Check Topic accumulation and individual Reference relation isolation and rejection of conflicting/stale evidence."""

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
from wave_review import WAVE_4_TOPICS, load_wave, scoped_sources


def sha(path):
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


class AccumulationChecks(unittest.TestCase):
    def setUp(self):
        self.parts = {p.stem: json.loads(p.read_text(encoding="utf-8"))
                      for p in (BASE / "wave-4/topics").glob("*.json")}

        self.relations = json.loads((BASE / "wave-4/reference-relations.json").read_text(encoding="utf-8"))

    def load(self, parts=None, relations=None):
        fixtures = copy.deepcopy(parts if parts is not None else self.parts)
        relation_fixture = copy.deepcopy(relations if relations is not None else self.relations)
        errors = []
        reviews, sources, ledgers = load_wave(
            BASE, ROOT, "efe73a15da14c996bd08344181d4d6f87073803d",
            lambda p: relation_fixture if p.stem == "reference-relations" else fixtures[p.stem], sha,
            lambda ok, message: errors.append(message) if not ok else None, wave=4)
        return reviews, sources, ledgers, errors

    def test_both_topics_and_first_evidence_survive(self):
        reviews, sources, ledgers, errors = self.load()
        self.assertEqual(errors, [])
        self.assertEqual(len(reviews), sum(c + q for _, c, q in WAVE_4_TOPICS.values()))
        area = ledgers["java"]
        self.assertEqual((len(area["topics"]), len(area["concepts"]), len(area["questions"])), tuple(map(sum, zip(*WAVE_4_TOPICS.values(), strict=True))))
        first = self.parts["java--language-types"]
        self.assertEqual(area["topicLedgers"][first["topicKey"]], first)
        for field in ("findings", "carriedForwardFindings", "visualizationAssets"):
            for item in first[field]:
                self.assertIn(item, area[field])
        self.assertEqual(sum(len(entries) for entries in sources.values()), len(self.relations["references"]))

    def test_shared_url_status_cannot_cross_topic(self):
        url = "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
        relations = copy.deepcopy(self.relations)
        entry = next(r for r in relations["references"] if r["contentKey"] == "java.core.object-model.static-vs-instance-members" and r["url"] == url)
        entry["evidenceLevel"] = "NEEDS_REVIEW"  # In-memory fixture only.
        _, sources, _, errors = self.load(relations=relations)
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


    def test_shared_url_status_cannot_cross_concept_in_topic(self):
        relations = copy.deepcopy(self.relations)
        key = "java.core.object-model.static-vs-instance-members"
        url = "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
        next(r for r in relations["references"] if r["contentKey"] == key and r["url"] == url)["evidenceLevel"] = "NEEDS_REVIEW"
        _, sources, _, errors = self.load(relations=relations)
        self.assertEqual(errors, [])
        self.assertEqual([r["evidenceLevel"] for r in scoped_sources(sources, url, "java", key)], ["NEEDS_REVIEW"])
        self.assertEqual([r["evidenceLevel"] for r in scoped_sources(sources, url, "java", "java.core.object-model.class-object-constructor")], ["CURRENT_VERIFIED"])

    def test_supporting_evidence_cannot_borrow_other_concept(self):
        relations = copy.deepcopy(self.relations)
        parts = copy.deepcopy(self.parts)
        key = "java.core.object-model.static-vs-instance-members"
        url = "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html"
        next(r for r in relations["references"] if r["contentKey"] == key and r["url"] == url)["evidenceLevel"] = "NEEDS_REVIEW"
        parts["java--object-model"]["supportingEvidence"] = {key: {"kind": "CHECKED_SOURCE", "urls": [url], "basis": "Synthetic fixture for denied borrowing"}}
        self.assertTrue(any("Unverified supporting URL relation" in e for e in self.load(parts, relations)[3]))

    def test_previous_44_relations_and_two_ledgers_survive(self):
        rows = [r for r in self.relations["references"] if not r["contentKey"].startswith("java.core.api-design.")]
        self.assertEqual(len(rows), 44)
        self.assertEqual(Counter(r["evidenceLevel"] for r in rows), {"CURRENT_VERIFIED": 43, "NEEDS_REVIEW": 1})
        for name in ["java--language-types", "java--object-model"]:
            path = BASE / "wave-4/topics" / (name + ".json")
            prior_bytes = subprocess.check_output(["git", "show", "81484fb00c172b5fa7e109e2aa3d914dba28b4c8:" + path.relative_to(ROOT).as_posix()], cwd=ROOT)
            self.assertEqual(path.read_bytes().replace(b"\r\n", b"\n"), prior_bytes)

    def test_duplicate_reference_relation_is_rejected(self):
        relations = copy.deepcopy(self.relations)
        relations["references"].append(copy.deepcopy(relations["references"][0]))
        self.assertTrue(any("Duplicate Reference relation" in e for e in self.load(relations=relations)[3]))

    def test_missing_reference_relation_is_rejected(self):
        relations = copy.deepcopy(self.relations)
        relations["references"].pop()
        self.assertTrue(any("Reference relation coverage" in e for e in self.load(relations=relations)[3]))

    def test_unrelated_reference_url_is_rejected(self):
        relations = copy.deepcopy(self.relations)
        relations["references"][0]["url"] = "https://example.com/not-canonical"
        self.assertTrue(any("front matter mismatch" in e for e in self.load(relations=relations)[3]))

    def test_stale_reference_source_is_rejected(self):
        relations = copy.deepcopy(self.relations)
        relations["references"][0]["sourceSha256"] = "0" * 64
        self.assertTrue(any("Stale Reference relation source" in e for e in self.load(relations=relations)[3]))

    def test_changed_reference_citation_is_rejected(self):
        relations = copy.deepcopy(self.relations)
        relations["references"][0]["reference"]["relationNote"] = "Not the canonical citation"
        self.assertTrue(any("front matter mismatch" in e for e in self.load(relations=relations)[3]))

    def test_missing_supporting_relation_is_rejected(self):
        relations = copy.deepcopy(self.relations)
        relations["supportingRelations"].pop()
        errors = self.load(relations=relations)[3]
        self.assertTrue(any("Supporting Reference relation coverage" in e for e in errors))
        self.assertTrue(any("Unverified supporting URL relation" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
