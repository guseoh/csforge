"""GET existing deployment SVGs, compare bytes; never download image files or write product data."""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import urllib.request


OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
BASE_URL = "https://csforge-befnm9k0a-guseoh.vercel.app"


def inspect(path):
    url = "/" + path.relative_to(ROOT / "frontend/public").as_posix()
    result = {"url": url, "deploymentUrl": BASE_URL + url}
    try:
        with urllib.request.urlopen(result["deploymentUrl"], timeout=20) as response:
            body = response.read()
            result.update(status=response.status, contentType=response.headers.get("Content-Type"),
                          finalUrl=response.geturl(), responseSha256=hashlib.sha256(body).hexdigest(),
                          sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                          matchesSourceIgnoringLineEndings=body.replace(b"\r\n", b"\n") == path.read_bytes().replace(b"\r\n", b"\n"))
    except Exception as error:
        result.update(status="NEEDS_REVIEW", error=str(error))
    return result


def main():
    paths = sorted((ROOT / "frontend/public/learning").rglob("*.svg"))
    with ThreadPoolExecutor(max_workers=4) as executor:
        assets = list(executor.map(inspect, paths))
    data = {"observedDate": datetime.now(timezone(timedelta(hours=9))).date().isoformat(), "deploymentId": 6851629801,
            "baselineSha": "efe73a15da14c996bd08344181d4d6f87073803d", "baseUrl": BASE_URL,
            "scope": "HTTP delivery/source-byte parity only; not semantic or responsive visual PASS", "assets": assets}
    (OUT / "deployment-evidence.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    passed = sum(a.get("status") == 200 and a.get("contentType", "").startswith("image/svg+xml")
                 and a.get("matchesSourceIgnoringLineEndings") for a in assets)
    print(f"Deployed SVG parity: {passed}/{len(assets)}; individual results in deployment-evidence.json")


if __name__ == "__main__":
    main()
