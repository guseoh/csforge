---
kind: concept
contentKey: backend.core.external.circuit-fallback
topicContentKey: backend.core.external
slug: circuit-fallback
title: "circuit breaker와 fallback"
summary: "반복 실패를 감지해 호출을 차단하는 상태 machine과 사용자에게 허용 가능한 fallback을 구분한다"
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://resilience4j.readme.io/docs/circuitbreaker"
    title: "Resilience4j Documentation: CircuitBreaker"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "CLOSED/OPEN/HALF_OPEN state와 failure window 동작 확인"
  - url: "https://www.rfc-editor.org/rfc/rfc9110.html"
    title: "RFC 9110 HTTP Semantics"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "fallback response를 설계할 때 HTTP representation과 status 의미 확인"
---
# circuit breaker와 fallback

외부 결제·추천·배송 API가 계속 실패할 때 매 요청이 같은 remote를 다시 두드리면 caller thread와 remote 부하가 함께 악화됩니다. Circuit breaker는 실패 신호를 관찰해 일정 시간 호출을 차단하고, 복구 여부를 제한된 probe로 확인하는 보호 장치입니다.

```text
                 실패 threshold
       ┌────────────────────────────┐
       │                            ▼
   CLOSED ───────────────────────▶ OPEN
       ▲                            │
       │ 성공 probe                  │ wait duration
       │                            ▼
       └──────────────────────── HALF_OPEN
                         실패 ───────┘
```

### state는 호출 정책을 바꾼다

- `CLOSED`: 호출을 허용하고 outcome을 기록합니다.
- `OPEN`: remote 호출을 즉시 거절해 실패가 전파되는 것을 줄입니다.
- `HALF_OPEN`: 복구 여부를 확인할 제한된 probe만 허용합니다.

실제 library는 sliding window, minimum call 수, failure/slow-call threshold와 특수 상태를 추가할 수 있습니다. 그러므로 상태 이름만 외우기보다 어떤 outcome을 실패로 기록하고 어느 조건에서 전이하는지 설정과 metric을 확인해야 합니다.

### circuit breaker가 call 자체를 동기화하는 것은 아니다

breaker가 OPEN인지 판단하고 호출 허가를 제어하는 것과 remote 함수 실행 시간을 보호하는 것은 다른 책임입니다. CLOSED 상태에서 여러 caller가 동시에 remote를 호출할 수 있으므로 동시 호출 수를 제한해야 한다면 bulkhead·connection pool·rate limit 같은 별도 제어가 필요합니다.

```text
circuit breaker -> 호출을 허용할지와 실패 window
bulkhead         -> 동시에 몇 개를 실행할지
timeout          -> 한 호출이 얼마나 기다릴지
```

### fallback은 실패를 숨기는 것이 아니다

fallback은 remote 결과를 대신해 반환할 수 있는 **허용된 의미**가 있을 때만 사용합니다. 캐시된 추천 목록이나 읽기 전용 기본값은 stale임을 표시하고 사용할 수 있지만, 결제 승인이나 재고 차감 결과를 임의의 성공으로 바꾸면 canonical 상태를 오염시킵니다.

```text
추천 API 실패 ─▶ 오래된 추천 목록 + stale 표시     가능할 수 있음
결제 승인 실패 ─▶ 결제 성공으로 응답               금지
재고 조회 실패 ─▶ “재고 충분”으로 추정             위험
```

fallback의 결과는 정상 결과와 동일한 신뢰 수준인지, 사용자가 재시도할 수 있는지, 나중에 reconciliation이 필요한지까지 계약에 포함해야 합니다.

### HALF_OPEN probe도 비용과 동시성을 제한한다

OPEN에서 바로 모든 traffic을 풀면 remote가 아직 회복되지 않았을 때 다시 폭주할 수 있습니다. 제한된 probe만 통과시키고 성공·실패 결과에 따라 CLOSED 또는 OPEN으로 전이해야 합니다. probe가 실패했을 때 얼마나 기다린 뒤 다시 시도할지도 backoff와 운영 목표에 맞춰 정합니다.

### 어떤 실패를 기록할지 선택한다

사용자 입력 오류, 인증 실패, 존재하지 않는 자원은 remote가 정상적으로 거절한 permanent failure일 수 있습니다. 이를 모두 circuit failure로 기록하면 정상적인 4xx가 회로를 열어버립니다. 반대로 timeout, connection refusal, 5xx, slow response처럼 remote availability를 나타내는 신호는 breaker 판단에 포함할 후보입니다.

### 운영에서는 state와 fallback을 함께 관측한다

다음 지표를 별도로 봅니다.

1. 현재 circuit state와 state transition 횟수
2. failure rate와 slow-call rate, 최소 표본 수
3. OPEN으로 거절된 호출 수
4. HALF_OPEN probe 성공·실패 수
5. fallback 응답 비율과 stale age
6. remote 정상화 뒤 복구까지 걸린 시간

breaker가 자주 열리는 것만 보고 threshold를 높이면 장애 신호를 늦출 수 있습니다. 반대로 threshold를 너무 낮추면 짧은 일시 오류에도 사용자 traffic을 fallback으로 보낼 수 있으므로 실제 workload와 허용된 degraded mode를 기준으로 조정합니다.

### 문제를 풀 때 확인할 것

1. 어떤 실패를 circuit failure로 셀지 확인합니다.
2. OPEN이 호출 부하를 줄이는지, 동시 실행 제한은 별도인지 구분합니다.
3. HALF_OPEN probe 수와 재전이 조건을 봅니다.
4. fallback이 정상 결과와 의미가 같은지, stale/partial임을 표현하는지 판단합니다.
5. 결제·재고처럼 성공을 추정하면 안 되는 side effect는 fallback하지 않습니다.

### 면접에서 설명한다면

Circuit breaker는 반복되는 timeout·unavailable·slow response를 관찰해 CLOSED, OPEN, HALF_OPEN 같은 상태로 호출 허용 여부를 바꾸는 보호 장치입니다. 이는 timeout이나 bulkhead를 대체하지 않으며, fallback도 모든 실패를 성공처럼 감추는 기능이 아닙니다. 사용자에게 허용 가능한 stale/partial 결과만 반환하고, 상태 전이·거절·fallback 비율을 운영 metric으로 확인해야 합니다.

