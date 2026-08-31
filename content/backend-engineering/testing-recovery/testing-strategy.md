---
kind: concept
contentKey: backend.core.testing-recovery.testing-strategy
topicContentKey: backend.core.testing-recovery
slug: testing-strategy
title: "테스트 전략과 신뢰 경계"
summary: "모든 것을 통합 테스트로 확인하거나 모든 것을 mock으로 격리하지 않고 실패 비용과 경계에 맞춰 테스트 층을 선택한다."
level: 2
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://docs.junit.org/current/user-guide/"
    title: "JUnit User Guide"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "Java 테스트 실행과 구조의 기본 계약을 참고한다."
---
# 테스트 전략과 신뢰 경계

좋은 테스트 전략은 테스트 개수를 많이 만드는 것이 아니라 **어떤 종류의 회귀를 어느 비용으로 잡을지**를 결정한다. 순수 도메인 규칙은 빠른 단위 테스트로 충분할 수 있지만 JPA mapping, transaction, SQL constraint 같은 경계는 실제 framework/DB와 연결해야 의미가 있다.

### 무엇을 믿지 않는지에 따라 테스트가 달라진다

| 위험                         | 적합한 검증 예              |
| ---------------------------- | --------------------------- |
| 계산/상태 전이 버그          | 단위 테스트                 |
| Controller validation/status | MVC/API slice               |
| JPA mapping/query            | DB integration test         |
| migration/import idempotency | 실제 PostgreSQL integration |
| 전체 사용자 흐름             | 소수의 end-to-end           |

mock repository로 테스트가 통과했다고 해서 실제 unique constraint, isolation, lazy loading이 맞다는 보장은 없다. 반대로 모든 작은 계산을 실제 DB와 함께 테스트하면 느리고 실패 원인도 흐려진다.

### 테스트는 구현 상세가 아니라 계약에 붙인다

메서드 내부 호출 순서까지 모두 mock verify하면 리팩터링만 해도 테스트가 깨진다. 가능한 경우 입력과 결과 상태, 외부 경계의 호출 계약을 검증한다.

```text
Given  : 주문이 CREATED
When   : 결제 완료 처리
Then   : PAID로 전이되고 완료 시각이 기록됨
Reject : 이미 CANCELLED면 전이 불가
```

### production과 다른 환경 차이도 위험이다

H2에서만 통과하고 PostgreSQL에서는 실패하는 SQL/locking 동작이 있을 수 있다. canonical storage가 PostgreSQL이라면 중요한 persistence contract는 같은 DB 계열에서 검증하는 편이 신뢰도가 높다.

테스트 전략의 핵심은 빠른 피드백과 실제 경계 신뢰도를 **한 종류의 테스트로 모두 해결하려 하지 않는 것**이다.
