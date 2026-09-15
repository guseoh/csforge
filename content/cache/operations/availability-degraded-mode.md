---
kind: concept
contentKey: cache.core.operations.availability-degraded-mode
topicContentKey: cache.core.operations
slug: availability-degraded-mode
title: "캐시 장애와 제한적 대체 처리"
summary: "cache timeout·unavailable 상황에서 원본 조회, stale 결과, 명확한 실패 중 무엇을 선택할지 correctness·deadline·origin capacity 관점에서 판단한다."
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
# 캐시 장애와 제한적 대체 처리

조회 성능을 위해 추가한 캐시가 장애를 일으켰을 때 가장 단순한 생각은 “그냥 DB에서 읽으면 된다”입니다. 하지만 트래픽 대부분을 cache가 흡수하던 시스템이라면 모든 요청을 갑자기 origin으로 보내는 순간 **Redis 장애가 PostgreSQL 과부하로 전파될 수 있습니다.**

```text
정상
requests ─▶ cache ── 일부 miss ─▶ DB

cache outage
requests ────────────────▶ DB
                              ▲
                       갑작스러운 부하 증가
```

### 어떤 대체 처리가 허용되는지는 데이터 의미가 결정한다

비핵심 추천 목록은 캐시가 없을 때 DB를 직접 조회하거나 조금 오래된 값을 반환해도 괜찮을 수 있습니다. 반면 권한 판정이나 결제 상태처럼 잘못된 값을 성공으로 간주하면 안 되는 데이터는 cache 장애를 이유로 검증을 건너뛰어서는 안 됩니다.

```text
추천 목록 cache 실패
→ bounded DB fallback / stale value 가능성 검토

권한 정보 cache 실패
→ "cache가 없으니 허용"은 위험
```

흔히 이를 fail-open/fail-closed라는 말로 설명하지만, 핵심은 용어가 아니라 **오래되거나 없는 값으로 계속 진행했을 때 correctness가 깨지는가**입니다.

### 대체 처리에도 용량 한계가 필요하다

Cache timeout을 오래 기다린 뒤 모든 요청이 DB fallback을 시작하면 요청 deadline과 connection pool을 동시에 소모합니다. Cache timeout은 상위 요청 budget보다 충분히 짧아야 하고, origin fallback도 concurrency나 rate를 제한할 수 있어야 합니다.

```text
request deadline
   │
   ├─ 짧은 cache attempt
   │
   └─ 남은 시간 안에서 bounded fallback
```

대체 처리 용량을 넘는 요청은 무한히 기다리게 하기보다 명확하게 실패시키는 편이 전체 시스템을 보호할 수 있습니다.

### cache 복구 후에도 부하가 생길 수 있다

Redis가 다시 살아났다고 바로 정상 상태로 돌아가는 것은 아닙니다. 비어 있는 cache를 수많은 요청이 동시에 채우면 cold-start stampede가 발생할 수 있습니다. 필요한 경우 점진적인 re-warm이나 요청 coalescing을 검토합니다.

캐시 장애 대응의 목표는 “항상 성공 응답을 만든다”가 아니라 **cache가 없어도 원본 데이터의 정확성을 지키면서, 제한된 자원 안에서 어떤 기능까지 계속 제공할지 정하는 것**입니다.
