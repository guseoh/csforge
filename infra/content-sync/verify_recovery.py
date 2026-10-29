"""Neon의 보존 설정과 과거 schema 조회를 읽기 전용 API로 검증한다."""
import datetime as dt
import json
import os
import re
import urllib.parse
import urllib.request


def verify(get, project_id, branch_id, database, now):
    if not re.fullmatch(r"[a-z0-9-]+", project_id) or not re.fullmatch(r"br-[a-z0-9-]+", branch_id):
        raise ValueError("Invalid Neon target identity")
    path = f"/projects/{project_id}"
    project = get(path)["project"]
    if project["id"] != project_id or project.get("history_retention_seconds", 0) < 3600:
        raise ValueError("At least one hour of configured recovery history is required")
    branch = get(f"{path}/branches/{branch_id}")["branch"]
    if branch["id"] != branch_id or branch["project_id"] != project_id or branch["current_state"] != "ready":
        raise ValueError("Recovery branch identity/state mismatch")
    historical = (now - dt.timedelta(minutes=5)).isoformat().replace("+00:00", "Z")
    query = urllib.parse.urlencode({"db_name": database, "timestamp": historical})
    schema = get(f"{path}/branches/{branch_id}/schema?{query}").get("sql", "")
    if not isinstance(schema, str) or not re.search(r"CREATE TABLE (?:public\.)?concept\s*\(", schema):
        raise ValueError("Historical canonical schema could not be read")
    return {"project": project_id, "branch": branch_id, "database": database,
            "historyRetentionSeconds": project["history_retention_seconds"],
            "historicalSchemaAt": historical, "verifiedAt": now.isoformat().replace("+00:00", "Z")}


def main():
    token = os.environ["NEON_API_KEY"]
    if not token:
        raise ValueError("NEON_API_KEY is not configured")

    def get(path):
        request = urllib.request.Request("https://console.neon.tech/api/v2" + path,
                headers={"Authorization": "Bearer " + token, "Accept": "application/json"})
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.load(response)

    evidence = verify(get, os.environ["NEON_PROJECT_ID"], os.environ["NEON_BRANCH_ID"],
            os.environ["NEON_DATABASE"], dt.datetime.now(dt.timezone.utc))
    # Only bounded metadata is retained; neither token nor schema is printed or uploaded.
    print(json.dumps(evidence))
    with open(os.environ["GITHUB_ENV"], "a") as output:
        output.write("RECOVERY_VERIFIED_AT=" + evidence["verifiedAt"] + "\n")


if __name__ == "__main__":
    main()
