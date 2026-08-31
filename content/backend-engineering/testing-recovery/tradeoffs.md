---
kind: concept
contentKey: backend.core.testing-recovery.tradeoffs
topicContentKey: backend.core.testing-recovery
slug: tradeoffs
title: "유지보수성과 기술 선택의 trade-off"
summary: "새 기술과 추상화를 기능 목록이 아니라 현재 책임, 측정 증거, 운영 비용을 기준으로 선택한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://martinfowler.com/articles/is-quality-worth-cost.html"
    title: "Is High Quality Software Worth the Cost?"
    referenceType: OTHER
    language: en
    displayOrder: 1
    relationNote: "내부 품질과 변경 비용의 관계를 생각하는 참고 자료다."
---
# 유지보수성과 기술 선택의 trade-off

기술 선택은 기능이 많은 도구를 고르는 문제가 아니다. Redis, Kafka, Elasticsearch, CQRS 같은 기술은 실제 책임을 해결할 때 강력하지만, 그 순간부터 장애 모드·배포·관측·데이터 일관성·학습 비용도 시스템의 책임이 된다.

### 문제보다 해법이 먼저 나오면 검증하기 어렵다

```text
"느리다"
   ↓
측정: 어느 요청? p95? DB? CPU? network?
   ↓
원인 후보
   ↓
가장 작은 변경
   ↓
전후 측정
```

이 과정을 건너뛰고 cache나 message broker를 넣으면 실제 병목은 그대로인데 복잡성만 늘어날 수 있다.

### 추상화도 비용이 있다

중복 코드 몇 줄을 없애기 위해 범용 framework를 만들면 호출 경로와 상태 변화가 숨겨질 수 있다. 반대로 여러 기능이 같은 정책을 반복하고 변경 이유도 같다면 명시적인 abstraction이 변경 비용을 낮춘다.

### 선택 기록에는 되돌릴 조건도 포함한다

| 기록할 것   | 예                              |
| ----------- | ------------------------------- |
| 현재 문제   | p95 900ms, DB query 650ms       |
| 선택        | composite index                 |
| 대안        | cache, query rewrite            |
| 결과        | p95 180ms                       |
| trade-off   | write cost 증가                 |
| 재검토 조건 | write throughput 문제가 생길 때 |

기술 선택의 품질은 '최신 기술을 썼는가'보다 **현재 문제를 설명하고, 대안을 비교하고, 적용 후 결과와 비용을 말할 수 있는가**로 평가하는 편이 낫다.
