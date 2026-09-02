---
kind: concept
contentKey: cache.core.operations.availability-degraded-mode
topicContentKey: cache.core.operations
slug: availability-degraded-mode
title: "cache 장애와 degraded mode"
summary: "cache timeout·unavailable 시 origin fallback과 fail-open/closed를 correctness·deadline·부하 관점에서 선택한다"
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "cache miss에서 origin fallback하는 기본 흐름 확인"
  - url: "https://redis.io/docs/latest/develop/reference/clients/"
    title: "Redis Documentation: Client Handling"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "client connection과 cache access 운영 경계 확인"
---
# cache 장애와 degraded mode

Cache는 optional derived infrastructure일 수 있지만, 장애 시 모든 요청이 무제한으로 origin으로 몰리면 optional이라는 말이 무색해집니다. cache timeout·connection failure·malformed value를 짧은 시간 안에 판단하고, 해당 데이터가 stale해도 되는지에 따라 degraded mode를 선택해야 합니다.

```text
request
  ├─ cache hit  ─▶ response
  ├─ cache miss ─▶ origin read ─▶ response
  └─ cache unavailable
       ├─ origin fallback (허용 시)
       ├─ stale/local fallback
       └─ 명확한 failure
```

### fail-open과 fail-closed는 업무 정책이다

추천 목록 같은 비핵심 read는 cache가 죽어도 origin에서 읽거나 stale 기본값을 반환하는 fail-open이 가능할 수 있습니다. 반면 cache에 권한 판단 결과가 있다면 cache failure를 “허용”으로 처리하는 fail-open이 권한 우회가 될 수 있어 fail-closed가 더 안전할 수 있습니다. cache 사용 목적과 correctness를 먼저 확인해야 합니다.

### origin fallback도 overload를 만든다

모든 request가 cache timeout을 기다린 뒤 DB로 fallback하면 timeout budget을 소진하고 DB connection pool을 동시에 고갈시킬 수 있습니다. cache client timeout을 request deadline보다 짧게 두고, fallback concurrency·rate limit·stale serve를 제한합니다.

```text
cache timeout 100ms
  └─ 10,000 requests가 동시에 DB fallback
      └─ cache 장애가 DB 장애로 전파될 수 있음
```

### cache outage와 data correctness를 구분한다

cache에 분석 summary가 없어지는 것은 재계산 지연일 수 있지만, canonical attempt나 review state를 cache에서만 복구하려 하면 데이터 손실입니다. cache outage runbook은 origin health, fallback capacity, stale age, recovery 후 재가열 방법을 포함해야 합니다.

### 문제를 풀 때 확인할 것

1. cache가 없어도 correctness가 유지되는지 확인합니다.
2. cache timeout과 상위 deadline을 맞춥니다.
3. origin fallback 동시성과 connection pool 영향을 계산합니다.
4. fail-open이 권한·금전·상태 변경을 우회하지 않는지 봅니다.
5. outage 중 stale serve와 recovery/re-warm을 관측합니다.

### 면접에서 설명한다면

Cache 장애 대응은 단순히 DB fallback을 켜는 문제가 아니라 timeout budget, origin capacity, stale 허용과 correctness를 함께 정하는 문제입니다. 비핵심 read는 fallback이나 stale 결과를 허용할 수 있지만 권한·금전·canonical 상태는 fail-open으로 처리하면 안 됩니다. cache outage가 origin overload로 전파되지 않도록 fallback concurrency와 관측을 둡니다.

