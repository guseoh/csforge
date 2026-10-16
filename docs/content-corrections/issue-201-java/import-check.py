"""Exercise old Java pack -> corrected pack -> exact reimport in a disposable DB.

Requires the task-owned localhost:18081 app and csforge-issue201-java-verify
container (localhost:15433, database csforge_issue201_test). Never targets the
default application or production database. Only run against a fresh container.
"""

import hashlib
import io
import json
from pathlib import Path
import subprocess
import tarfile
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE = "90f7c5bddcf074a08e523b8b54130ebfce96a28d"
URL = "http://127.0.0.1:18081"
CONTAINER = "csforge-issue201-java-verify"


def sql(statement):
    result = subprocess.run(["docker", "exec", "-i", CONTAINER, "psql", "-X", "-A", "-t",
                             "-v", "ON_ERROR_STOP=1", "-U", "csforge", "-d", "csforge_issue201_test"],
                            input=statement, capture_output=True, encoding="utf-8", check=True)
    return result.stdout.strip()


def post(path, body=None, content_type="application/json"):
    request = urllib.request.Request(URL + path, data=body if body is not None else b"",
                                     headers={"Content-Type": content_type}, method="POST")
    with urllib.request.urlopen(request, timeout=300) as response:
        return json.load(response)


def multipart(files, digest=None):
    boundary = "issue201-" + uuid.uuid4().hex
    chunks = []
    for name, data in files:
        chunks.append((f'--{boundary}\r\nContent-Disposition: form-data; name="files"; '
                       f'filename="{name}"\r\nContent-Type: application/octet-stream\r\n\r\n').encode() + data + b"\r\n")
    if digest is not None:
        chunks.append((f'--{boundary}\r\nContent-Disposition: form-data; name="previewDigest"\r\n'
                       f'Content-Type: text/plain\r\n\r\n{digest}\r\n').encode())
    chunks.append(f"--{boundary}--\r\n".encode())
    return b"".join(chunks), "multipart/form-data; boundary=" + boundary


def apply_batches(files, expected_unchanged=False):
    groups = [[f for f in files if f[0].endswith("topics.json")],
              [f for f in files if f[0].endswith(".md")],
              [f for f in files if f[0].endswith("questions.json")]]
    counts = {"created": 0, "updated": 0, "unchanged": 0, "errors": 0}
    classifications = {}
    for group in groups:
        for offset in range(0, len(group), 100):
            batch = group[offset:offset + 100]
            data, kind = multipart(batch)
            preview = post("/api/imports/preview", data, kind)
            assert preview["canApply"] and preview["totals"]["errors"] == 0, preview
            for item in preview["items"]:
                classifications[item["contentKey"]] = item["classification"]
                if expected_unchanged:
                    assert item["classification"] == "UNCHANGED", item
            data, kind = multipart(batch, preview["previewDigest"])
            applied = post("/api/imports/apply", data, kind)
            for key in counts:
                counts[key] += applied["totals"].get(key, 0)
            assert applied["totals"].get("failed", 0) == 0, applied
    assert counts["errors"] == 0
    return counts, classifications


def snapshot():
    tables = ["attempt", "wrong_note", "review_schedule", "review_history", "quiz_session",
              "personal_note", "concept_progress", "reference", "concept_reference", "question_concept"]
    result = {table: json.loads(sql(f"select coalesce(json_agg(t), '[]'::json) from (select * from {table} order by 1,2) t;"))
              for table in tables}
    result["questionIds"] = json.loads(sql("select json_agg(t) from (select id,content_key from question order by id) t;"))
    result["conceptIds"] = json.loads(sql("select json_agg(t) from (select id,content_key from concept order by id) t;"))
    return result


def main():
    assert sql("select current_database();") == "csforge_issue201_test"
    assert sql("select count(*) from attempt;") == "0", "Requires a fresh task-owned database"
    if sql("select count(*) from concept;") == "0":
        boot = post("/api/canonical-bootstrap")
        assert boot["success"], boot
    assert sql("select count(*) from concept;") == "721"
    assert sql("select count(*) from question;") == "2525"
    print("Isolated canonical baseline ready", flush=True)
    archive = subprocess.check_output(["git", "archive", BASE, "content/java"], cwd=ROOT)
    with tarfile.open(fileobj=io.BytesIO(archive)) as source:
        before_files = [(entry.name.removeprefix("content/"), source.extractfile(entry).read())
                        for entry in source if entry.isfile()]
    before_files.sort()
    old_counts, _ = apply_batches(before_files)
    print("Old Java pack applied: " + json.dumps(old_counts), flush=True)
    checkpoint = json.loads((HERE / "source-checkpoint.json").read_text(encoding="utf-8"))
    keys = [q["contentKey"] for q in checkpoint["questionChanges"]]
    in_keys = ",".join("'" + k + "'" for k in keys)
    sql(f"""
insert into quiz_session (started_at,source) values (current_timestamp,'STANDARD');
insert into attempt (quiz_session_id,question_id,grading_status,correct,answered_at,graded_at)
select (select max(id) from quiz_session),q.id,'GRADED',false,current_timestamp,current_timestamp
from question q where q.content_key in ({in_keys});
insert into wrong_note (question_id,status,wrong_count,first_wrong_at,last_wrong_at,last_wrong_attempt_id)
select question_id,'ACTIVE',1,current_timestamp,current_timestamp,id from attempt;
insert into review_schedule (question_id,status,stage,due_at,last_reviewed_at,last_processed_attempt_id)
select question_id,'SCHEDULED',1,current_timestamp + interval '1 day',current_timestamp,id from attempt;
insert into review_history (question_id,quiz_session_id,attempt_id,result,stage_before,stage_after,reviewed_at,next_due_at)
select question_id,quiz_session_id,id,'WRONG',1,1,current_timestamp,current_timestamp + interval '1 day' from attempt;
insert into personal_note (concept_id,content)
select id,'Issue201 isolated learner note' from concept where content_key like 'java.core.%';
insert into concept_progress (concept_id,status,bookmarked,first_viewed_at,last_viewed_at)
select id,'LEARNING',true,current_timestamp,current_timestamp from concept where content_key like 'java.core.%';
""")
    initial = snapshot()
    assert len(initial["attempt"]) == len(keys) == 37
    assert len(initial["personal_note"]) == 145
    print("37 Question histories and 145 Concept notes/progress snapshotted", flush=True)
    files = [(p.relative_to(ROOT / "content").as_posix(), p.read_bytes())
             for p in sorted((ROOT / "content/java").rglob("*")) if p.is_file()]
    updated, classifications = apply_batches(files)
    expected_keys = {r["contentKey"] for r in checkpoint["sources"] if "contentKey" in r} | set(keys)
    assert {key for key, kind in classifications.items() if kind == "UPDATED"} == expected_keys
    assert updated["updated"] == 19 + 37 and updated["created"] == 0, updated
    assert snapshot() == initial, "Personal/history/identity/Reference changed during correction Apply"
    print("Corrected Java pack applied; identity/history/Reference snapshot equal", flush=True)
    repeated, _ = apply_batches(files, expected_unchanged=True)
    assert repeated == {"created": 0, "updated": 0, "unchanged": 1004, "errors": 0}, repeated
    assert snapshot() == initial, "Personal/history/identity/Reference changed during exact reimport"
    digest = hashlib.sha256(json.dumps(initial, sort_keys=True).encode()).hexdigest()
    report = {"database": "csforge_issue201_test", "api": URL, "productionTouched": False,
              "oldPackApply": old_counts, "correctionApply": updated, "exactReimport": repeated,
              "seededAttempts": 37, "seededWrongNotes": 37, "seededReviews": 37,
              "seededNotes": 145, "seededProgress": 145, "historyAndReferenceSha256BeforeAfter": digest,
              "allSnapshotsEqual": True}
    (HERE / "import-validation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
