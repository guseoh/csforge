"""Read-only URL, title and anchor evidence; this does not assert semantic approval."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html import unescape
import json
from pathlib import Path
import re
from urllib.parse import urldefrag, unquote
from urllib.request import Request, urlopen

folder = Path(__file__).resolve().parent
candidates = json.loads((folder / "reference-candidates.json").read_text(encoding="utf-8"))


def inspect(url):
    address, anchor = urldefrag(url)
    result = {"url": url, "concepts": candidates[url], "checkedAt": datetime.now(timezone.utc).isoformat()}
    try:
        request = Request(address, headers={"User-Agent": "Mozilla/5.0 CSForge-reference-validation"})
        with urlopen(request, timeout=25) as response:
            body = response.read(8_000_000).decode(response.headers.get_content_charset() or "utf-8", errors="replace")
            result.update(status=response.status, finalUrl=response.url)
        title = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
        result["title"] = unescape(re.sub(r"\s+", " ", title.group(1))).strip() if title else None
        ids = re.findall(r'(?:id|name)=[\"\']([^\"\']+)[\"\']', body)
        result["anchorPresent"] = not anchor or unquote(anchor) in [unescape(value) for value in ids]
        text = re.sub(r"<(script|style)\b[^>]*>.*?</\1>", " ", body, flags=re.I | re.S)
        text = unescape(re.sub(r"<[^>]+>", " ", text))
        result["excerpt"] = re.sub(r"\s+", " ", text).strip()[:1600]
        result["textCharacters"] = len(text.strip())
    except Exception as error:
        result["error"] = str(error)
    return result


with ThreadPoolExecutor(max_workers=6) as pool:
    results = list(pool.map(inspect, candidates))
(folder / "reference-http-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
failures = [item for item in results if item.get("status") != 200 or not item.get("anchorPresent")]
print(f"URLs={len(results)}, HTTP/anchor issues={len(failures)}")
for item in failures:
    print(item["url"], item.get("error") or f'anchorPresent={item.get("anchorPresent")}')
