"""Rebuild the #155 choice-rationale benchmark from canonical and historical content."""

import json
import pathlib
import random
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[3]
CONTENT = ROOT / "content"
OUT = ROOT / "experiments/jev-content-quality/data/rationale-cases.jsonl"
RNG = random.Random(155)
SOURCE_REF = "e4b8cc5ee236c2cb916d6b03be3a135156f7e997"
CRITERIA = ("choice_rationale_misalignment", "choice_rationale_conflict", "choice_rationale_shallow")
HISTORY = (
    ("709b2c42", "content/java/concurrency/questions.json", "java.core.concurrency.blockingqueue-producer-consumer.q5", "A", "choice_rationale_misalignment"),
    ("3f7ab729", "content/java/design-patterns/questions.json", "java.core.design-patterns.state-pattern.q3", "A", "choice_rationale_conflict"),
    ("4ed84cc0", "content/backend-engineering/list/questions.json", "backend.core.list.pagination.q1", "D", "choice_rationale_conflict"),
    ("4ed84cc0", "content/java/coding-tests/questions.json", "java.core.coding-tests.comparator-for-coding-tests.q4", "B", "choice_rationale_misalignment"),
    ("465975ce", "content/computer-architecture/data-representation/questions.json", "computer-architecture.core.data-representation.signed-twos-complement.q1", "C", "choice_rationale_conflict"),
)
NATURAL_POSITIVE = {"java.core.design-patterns.adapter-pattern.q1:D": "Adapter의 책임이 아니라고만 하며 상태 전이 저장이 왜 맞지 않는지 설명하지 않는다."}
NATURAL_REASONS = {
    "backend-engineering": ("반복 요청의 서버 효과와 응답 표현을 구분한다.", "고정 Clock으로 만료 경계를 재현할 수 있음을 설명한다.", "POST도 idempotency key로 중복 처리가 가능함을 설명한다."),
    "cache": ("TTL은 만료만 제어하고 key 충돌을 막지 못함을 설명한다.", "cache 장애 시 timeout과 origin 과부하 제한을 함께 설명한다.", "origin에 반영되지 않은 write는 cache miss로 복구되지 않음을 설명한다."),
    "computer-architecture": ("양수 offset은 base 주소에 더한다는 계산을 제시한다.", "miss penalty가 miss 비율에만 추가되는 식을 설명한다.", "register spill과 물리 cache line 수를 구분한다."),
    "database": ("통계가 planner의 row 수 추정에 쓰임을 설명한다.", "plain VACUUM의 내부 공간 재사용과 파일 축소를 구분한다.", "FK가 별도 복제 email 값의 일치를 보장하지 않음을 설명한다."),
    "distributed-systems": ("일관성 선택은 partition 방지가 아니라 일부 응답 포기임을 설명한다.", "R+W>N이면 집합이 교차한다는 근거를 제시한다.", "오래된 leader의 외부 부작용에는 sink의 fencing 검사가 필요함을 설명한다."),
    "dsa": ("점근 표기에서 계수와 낮은 차수 항을 버리는 이유를 제시한다.", "원소별 상수 작업이 n에 비례함을 계산한다.", "state별 저장이 없으면 같은 계산을 반복한다는 근거를 제시한다."),
    "infrastructure-cloud": ("egress는 public internet 외 내부 목적지도 포함함을 설명한다.", "동일 image 재사용과 secret 노출 분리를 설명한다.", "CPU request는 scheduler 입력이지 실제 사용량 고정값이 아님을 설명한다."),
    "java": ("상태 전이 저장은 Adapter 책임이 아니라고만 선언해 구체적 이유가 없다.", "JDK proxy가 interface 호출을 handler로 위임함을 설명한다.", "StringBuilder는 concurrent queue도 동기화 수단도 아님을 설명한다."),
    "messaging-async": ("권한 거부는 시간 경과만으로 회복되지 않아 retry 후보가 아님을 설명한다.", "DB state와 outbox intent의 원자적 commit을 설명한다.", "worker 수 증가와 aggregate event 순서를 구분한다."),
    "network-http": ("Expires와 max-age의 충돌을 날짜 최대값으로 결정하지 않음을 설명한다.", "age 20초가 max-age 60초 내임을 계산한다.", "DNS hostname과 fragment의 처리 경계를 설명한다."),
    "operating-systems": ("PID는 burst 길이가 아니므로 SJF 선택 기준이 아님을 설명한다.", "anonymous pipe의 단방향 byte stream을 설명한다.", "lock 및 scheduler 공정성도 starvation 원인임을 설명한다."),
    "performance-observability-operations": ("commander가 모든 조작을 독점하면 병목이 생기는 이유를 설명한다.", "CPU 외 queue age와 downstream 한계를 근거로 든다.", "profiler와 load test가 자동 증명하지 못하는 범위를 구분한다."),
    "security": ("permitAll이 요청 자체를 제거하지 않음을 설명한다.", "provider의 supports token type에 따른 위임을 설명한다.", "HttpOnly는 cookie 읽기만 제한하고 XSS 실행을 막지 않음을 설명한다."),
    "spring": ("낮은 CPU와 pending connection 증가가 CPU 포화 가설에 맞지 않음을 설명한다.", "DTO 형식 검증과 domain 상태 전이 보호를 구분한다.", "singleton의 공유 범위와 request scope를 구분한다."),
    "system-design": ("peak QPS 외 크기·보존·복제가 저장 capacity를 정함을 설명한다.", "bulkhead가 공유 자원 고갈을 막는 경로를 설명한다.", "projection 독립 write의 충돌과 canonical owner 필요성을 설명한다."),
}
HISTORY_REASONS = (
    "capacity 선택지인데 task 처리 성공 여부를 설명해 다른 주장에 대한 근거가 붙었다.",
    "State의 세 번째 archive 호출이 거부되는 실제 전이와 달리 합법적이라고 설명했다.",
    "page size가 DB 내부 읽기·정렬 비용까지 제한하는 것처럼 과장했다.",
    "score/name 비교 선택지인데 distance/name 비교 규칙을 설명했다.",
    "-1의 two's-complement 도출에서 0에 1의 보수를 더한다고 잘못 설명했다.",
)
SYNTHETIC = (
    ("backend.core.api.resource-endpoint.q1", "B", "choice_rationale_misalignment", None, "D"),
    ("cache.core.consistency.ttl-freshness.q1", "A", "choice_rationale_conflict", "Hit ratio가 높으면 원본 데이터의 변경 빈도나 허용 가능한 stale 기간을 따질 필요가 없다. 요청을 자주 cache에서 처리한다는 사실만으로 긴 TTL이 안전해진다.", None),
    ("computer-architecture.core.cache-organization.direct-mapped-cache.q1", "B", "choice_rationale_shallow", "이 설명은 틀리다.", None),
    ("database.core.isolation.anomalies.q2", "A", "choice_rationale_misalignment", None, "D"),
    ("distributed.core.coordination.saga-compensation.q1", "B", "choice_rationale_conflict", "Saga는 서로 다른 service DB의 작업을 자동으로 하나의 local ACID transaction에 묶는다. 따라서 한 단계가 실패하면 모든 서비스의 이미 확정된 write도 원자적으로 rollback된다.", None),
    ("dsa.core.algorithm-selection.constraint-to-complexity.q1", "B", "choice_rationale_shallow", "이 선택지는 오답이다.", None),
    ("infrastructure.core.network.load-balancing-ingress.q1", "A", "choice_rationale_misalignment", None, "D"),
    ("java.core.api-design.static-factory-method.q1", "A", "choice_rationale_conflict", "Static factory method는 이름이 붙은 생성 경로이므로 호출할 때마다 반드시 새 instance를 생성한다. 같은 instance를 cache하거나 재사용할 수 없다.", None),
    ("messaging.core.delivery.at-least-once-idempotency.q1", "A", "choice_rationale_shallow", "정답이 아니다.", None),
)


def git_show(ref, path):
    return json.loads(subprocess.check_output(["git", "show", f"{ref}:{path}"], cwd=ROOT, encoding="utf-8-sig"))


def find_question(items, key):
    return next(q for q in items if q.get("contentKey") == key)


def as_case(case_id, group_id, source_kind, split, area, question, choice_key, gold, reason, source):
    choice = next(c for c in question["choices"] if c["key"] == choice_key)
    return {
        "caseId": case_id,
        "groupId": group_id,
        "sourceKind": source_kind,
        "split": split,
        "area": area,
        "contentKey": question["contentKey"],
        "choiceKey": choice_key,
        "promptMarkdown": question["promptMarkdown"],
        "choices": [{"key": c["key"], "content": c["content"]} for c in question["choices"]],
        "correctChoiceKey": question["correctChoiceKey"],
        "explanationMarkdown": question["explanationMarkdown"],
        "rationaleMarkdown": choice["rationaleMarkdown"],
        "gold": {criterion: criterion in gold for criterion in CRITERIA},
        "goldReason": reason,
        "source": source,
    }


def natural_cases():
    result = []
    chosen_keys = set()
    historical_keys = {entry[2] for entry in HISTORY}
    for area_dir in sorted(p for p in CONTENT.iterdir() if p.is_dir()):
        area = area_dir.name
        candidates = [(p, q) for p in sorted(area_dir.rglob("questions.json"))
                      for q in json.loads(p.read_text(encoding="utf-8-sig"))
                      if q.get("kind") == "question" and q.get("questionType") == "MULTIPLE_CHOICE"
                      and q.get("contentKey") not in historical_keys
                      and len(q.get("choices", [])) == 4
                      and all(c.get("rationaleMarkdown") for c in q["choices"])]
        if not candidates:
            continue
        if len(candidates) < 3:
            raise ValueError(f"Insufficient MC rationale candidates in {area}")
        shortest = min(candidates, key=lambda item: min(len(c["rationaleMarkdown"]) for c in item[1]["choices"]))
        remaining = [item for item in candidates if item[1]["contentKey"] != shortest[1]["contentKey"]]
        correct = RNG.choice(remaining)
        remaining = [item for item in remaining if item[1]["contentKey"] != correct[1]["contentKey"]]
        distractor = RNG.choice(remaining)
        for slot, (path, q) in enumerate((shortest, correct, distractor)):
            choice = (min(q["choices"], key=lambda c: len(c["rationaleMarkdown"])) if slot == 0 else
                      next(c for c in q["choices"] if c["key"] == q["correctChoiceKey"]) if slot == 1 else
                      RNG.choice([c for c in q["choices"] if c["key"] != q["correctChoiceKey"]]))
            key = f"{q['contentKey']}:{choice['key']}"
            positive_reason = NATURAL_POSITIVE.get(key)
            reason = positive_reason or NATURAL_REASONS[area][slot]
            split = "development" if (slot == 0 and area != "java") or (slot == 1 and area == "java") else "holdout"
            result.append(as_case(f"natural-{area}-{slot}", key, "natural", split, area, q, choice["key"],
                                  {"choice_rationale_shallow"} if positive_reason else set(), reason,
                                  {"kind": "canonical", "path": str(path.relative_to(ROOT)).replace("\\", "/"), "ref": SOURCE_REF}))
            chosen_keys.add(q["contentKey"])
    return result, chosen_keys


def historical_cases():
    result = []
    for index, (commit, path, key, choice, criterion) in enumerate(HISTORY):
        split = "development" if index < 3 else "holdout"
        for version, ref, gold in (("before", f"{commit}^", {criterion}), ("after", commit, set())):
            q = find_question(git_show(ref, path), key)
            reason = (HISTORY_REASONS[index] if gold else
                      f"PR #158의 {commit} 수정 뒤 '{next(c for c in q['choices'] if c['key'] == choice)['rationaleMarkdown'][:70]}'로 해당 결함이 해소됐다.")
            result.append(as_case(f"history-{index}-{version}", f"history-{index}", "historical", split,
                                  key.split(".")[0], q, choice, gold, reason,
                                  {"kind": "pr158", "path": path, "ref": ref, "fixCommit": commit}))
    return result


def synthetic_cases(used):
    questions = {q["contentKey"]: (path, q) for path in sorted(CONTENT.rglob("questions.json"))
                 for q in json.loads(path.read_text(encoding="utf-8-sig")) if q.get("kind") == "question"}
    result = []
    for index, (key, choice_key, criterion, replacement, donor_key) in enumerate(SYNTHETIC):
        if key in used or key in {entry[2] for entry in HISTORY}:
            raise ValueError(f"Synthetic source overlaps benchmark source: {key}")
        path, original = questions[key]
        split = "development" if index < 3 else "holdout"
        source = {"kind": "controlled-edit", "path": str(path.relative_to(ROOT)).replace("\\", "/"), "ref": SOURCE_REF}
        result.append(as_case(f"synthetic-{index}-original", f"synthetic-{index}", "synthetic", split,
                              path.relative_to(CONTENT).parts[0], original, choice_key, set(),
                              f"원본 선택지 {choice_key}는 '{next(c for c in original['choices'] if c['key'] == choice_key)['rationaleMarkdown'][:95]}'로 조건이나 인과를 설명한다.", source))
        edited = json.loads(json.dumps(original))
        target = next(c for c in edited["choices"] if c["key"] == choice_key)
        target["rationaleMarkdown"] = (replacement if replacement is not None else
                                       next(c["rationaleMarkdown"] for c in original["choices"] if c["key"] == donor_key))
        reason = (f"선택지 {choice_key}의 근거가 아닌 선택지 {donor_key}의 근거를 붙였다." if criterion == "choice_rationale_misalignment" else
                  f"선택지 {choice_key}의 잘못된 주장을 사실로 설명한다." if criterion == "choice_rationale_conflict" else
                  f"선택지 {choice_key}의 정오만 선언하고 조건이나 인과 근거가 없다.")
        result.append(as_case(f"synthetic-{index}-edited", f"synthetic-{index}", "synthetic", split,
                              path.relative_to(CONTENT).parts[0], edited, choice_key, {criterion}, reason,
                              {**source, "edit": criterion, "donorChoiceKey": donor_key}))
    return result


def main():
    if subprocess.run(["git", "diff", "--quiet", SOURCE_REF, "--", "content"], cwd=ROOT).returncode != 0:
        raise ValueError("Canonical content differs from the frozen source commit")
    natural, used = natural_cases()
    historical = historical_cases()
    cases = natural + historical + synthetic_cases(used)
    OUT.write_text("".join(json.dumps(case, ensure_ascii=False, separators=(",", ":")) + "\n" for case in cases), encoding="utf-8")
    print(f"Wrote {len(cases)} cases to {OUT}")


if __name__ == "__main__":
    main()
