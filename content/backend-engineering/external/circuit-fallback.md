---
kind: concept
contentKey: backend.core.external.circuit-fallback
topicContentKey: backend.core.external
slug: circuit-fallback
title: "Circuit Breaker와 대체 처리"
summary: "반복되는 원격 실패가 local 자원을 계속 소모할 때 circuit breaker가 호출 허용 상태를 바꾸는 원리와 timeout·bulkhead·fallback의 서로 다른 책임을 구분한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://resilience4j.readme.io/docs/circuitbreaker"
    title: "Resilience4j Documentation: CircuitBreaker"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "CLOSED/OPEN/HALF_OPEN 상태와 failure/slow-call window 동작 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc9110"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "fallback response를 설계할 때 HTTP representation과 status 의미 확인"
  - url: "https://resilience4j.readme.io/docs/bulkhead"
    title: "Resilience4j Documentation: Bulkhead"
    referenceType: OFFICIAL
    language: en
    displayOrder: 3
    relationNote: "bounded concurrency와 resource isolation 경계 확인"
---
# Circuit Breaker와 대체 처리

외부 서비스가 계속 timeout이나 5xx를 반환하는데 모든 사용자 요청이 같은 dependency를 계속 호출하면 실패 자체보다 **기다리는 local thread·connection과 원격 부하가 함께 누적되는 문제**가 커질 수 있습니다. Circuit breaker는 이런 반복 실패를 관찰해 일정 조건에서 호출을 빠르게 거절하고, 이후 제한된 호출로 복구 여부를 확인하는 패턴입니다.

```text
정상 호출 허용
   CLOSED
      │ failure/slow-call threshold 초과
      ▼
    OPEN
      │ wait duration 경과
      ▼
 HALF_OPEN
   │      │
회복     실패 지속
   │      │
   ▼      ▼
CLOSED   OPEN
```

Resilience4j 같은 구현에서는 최소 표본 수, sliding window, failure rate, slow-call rate, HALF_OPEN에서 허용할 호출 수가 설정에 따라 달라집니다. 따라서 "한 번 실패하면 OPEN", "probe 한 번 성공하면 CLOSED" 같은 규칙으로 일반화하지 않습니다.

### Circuit breaker는 timeout을 대신하지 않는다

Breaker가 `CLOSED` 상태라면 실제 remote 호출은 여전히 실행됩니다. 한 호출이 얼마나 오래 기다릴지는 timeout/deadline이 제한해야 합니다.

```text
timeout          → 한 호출이 기다릴 수 있는 시간
circuit breaker  → 최근 실패 상태를 보고 새 호출을 허용할지
```

Timeout이 없는데 breaker만 둔다면 첫 호출들이 매우 오래 매달릴 수 있고, breaker가 OPEN되기 위한 결과 자체도 늦게 쌓일 수 있습니다.

### 동시 실행량을 제한하는 책임도 별개다

Remote가 느릴 때 CLOSED 상태에서 수백 개 요청이 동시에 들어오면 breaker가 아직 열리기 전 local capacity가 소진될 수 있습니다. Bulkhead는 특정 dependency가 사용할 수 있는 **동시 실행량이나 별도 execution resource를 제한**해 다른 작업까지 함께 고갈되는 것을 줄이는 패턴입니다.

```text
Circuit breaker → 호출 허용 여부
Bulkhead        → 동시에 사용할 수 있는 capacity
Timeout         → 호출 하나의 시간 상한
```

이 세 가지를 항상 모두 도입해야 한다는 뜻은 아닙니다. 실제 장애에서 어떤 자원이 고갈되는지 측정한 뒤 필요한 보호 수단을 선택합니다.

### Fallback은 실패를 성공으로 꾸미는 기능이 아니다

외부 호출에 실패했을 때 대체할 수 있는 결과가 제품 의미상 존재할 때만 fallback이 안전합니다.

```text
추천 서비스 실패
→ 최근 캐시된 추천 + stale 표시       가능할 수 있음

결제 승인 실패
→ "결제 성공"으로 임의 응답          허용하면 안 됨

재고 조회 실패
→ 재고 충분하다고 추정                위험
```

Fallback 결과가 정상 결과보다 오래됐거나 기능이 줄어든 상태라면 그 차이를 사용자나 상위 로직이 알아야 할 수 있습니다. 대체 처리는 availability 숫자를 높이는 것이 목적이 아니라 **제품이 허용한 degraded mode를 명시적으로 제공하는 것**입니다.

### 어떤 실패를 breaker 통계에 포함할지도 정책이다

사용자가 잘못된 요청을 보내 remote가 정상적으로 400을 반환한 경우와, remote가 timeout·connection failure·5xx를 내는 경우는 의미가 다릅니다. 모든 4xx까지 실패율에 넣으면 상대 시스템이 건강한데도 잘못된 사용자 요청 때문에 circuit이 열릴 수 있습니다.

따라서 adapter가 공급자 응답을 먼저 의미 있는 실패로 분류하고, **remote 가용성을 나타내는 실패만 breaker 판단에 포함할지** 명시적으로 정합니다.

Circuit breaker를 도입할 때 가장 먼저 봐야 할 것은 라이브러리 annotation이 아니라 **반복 실패가 실제로 어떤 local capacity와 remote 부하를 증폭시키고 있는가, 그리고 호출 차단·동시성 제한·시간 제한·대체 처리 중 어떤 책임이 필요한가**입니다.
