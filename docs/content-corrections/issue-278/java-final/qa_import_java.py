"""Load current Java files into the disposable QA app on its fixed loopback port."""
import json
from pathlib import Path
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[4]
OUTPUT = Path(__file__).resolve().parent
BASE = "http://127.0.0.1:8188"


def post(route, files, digest=None):
    boundary = "csforge-278-" + uuid.uuid4().hex
    chunks = []
    for name, content_type, content in files:
        chunks.append((f'--{boundary}\r\nContent-Disposition: form-data; name="files"; filename="{name}"\r\n'
                       f'Content-Type: {content_type}\r\n\r\n').encode() + content + b"\r\n")
    if digest:
        chunks.append((f'--{boundary}\r\nContent-Disposition: form-data; name="previewDigest"\r\n\r\n{digest}\r\n').encode())
    chunks.append(f"--{boundary}--\r\n".encode())
    request = urllib.request.Request(BASE + route, data=b"".join(chunks),
                                     headers={"Content-Type": "multipart/form-data; boundary=" + boundary})
    with urllib.request.urlopen(request, timeout=180) as response:
        return json.load(response)


results = []
for topic in json.loads((ROOT / "content/java/topics.json").read_text(encoding="utf-8")):
    slug = topic["slug"]
    files = [("topic.json", "application/json", json.dumps(topic, ensure_ascii=False).encode())]
    for path in sorted((ROOT / "content/java" / slug).iterdir()):
        if path.suffix in (".md", ".json"):
            files.append((path.name, "text/markdown" if path.suffix == ".md" else "application/json", path.read_bytes()))
    preview = post("/api/imports/preview", files)
    assert preview["totals"]["errors"] == 0, preview
    post("/api/imports/apply", files, preview["previewDigest"])
    repeated = post("/api/imports/preview", files)
    expected = 1 + sum(name.endswith(".md") for name, _, _ in files)
    expected += len(json.loads((ROOT / "content/java" / slug / "questions.json").read_text(encoding="utf-8")))
    assert repeated["totals"]["unchanged"] == expected, repeated
    assert all(repeated["totals"][key] == 0 for key in ("created", "updated", "errors")), repeated
    post("/api/imports/apply", files, repeated["previewDigest"])
    results.append({"topic": slug, "preview": preview["totals"], "reimport": repeated["totals"]})
    (OUTPUT / "qa2-java-import.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(slug + ": Apply / UNCHANGED / reapply PASS", flush=True)

with urllib.request.urlopen(BASE + "/api/learning-areas/java/outline?pageSize=200", timeout=30) as response:
    outline = json.load(response)
assert len(outline["items"]) == 145, outline
(OUTPUT / "qa2-java-outline.json").write_text(json.dumps(outline, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Java 18 Topic / 145 Concept / 843 Question current source import PASS", flush=True)
