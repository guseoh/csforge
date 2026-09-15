---
kind: concept
contentKey: cache.core.consistency.stampede
topicContentKey: cache.core.consistency
slug: stampede
title: "동시 만료와 캐시 폭주"
summary: "인기 key가 만료될 때 여러 요청이 동시에 원본을 조회하는 cache stampede를 이해하고 single-flight·lock·early refresh의 비용을 비교한다."
level: 3
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "popular key expiration과 stampede mitigation 확인"
---
# 동시 만료와 캐시 폭주

캐시는 원본 저장소의 부하를 줄이기 위해 사용하지만, 인기 key가 만료되는 순간에는 반대로 원본에 요청을 한꺼번에 몰아넣을 수 있습니다. 여러 요청이 거의 동시에 miss를 보면 모두 같은 DB 조회나 외부 호출을 시작하기 때문입니다.

```text
popular key 만료
   ├─ A miss ─▶ DB query
   ├─ B miss ─▶ DB query
   ├─ C miss ─▶ DB query
   └─ D miss ─▶ DB query
```

이처럼 하나의 값을 다시 채우기 위해 동일한 비싼 작업이 중복 실행되는 현상을 cache stampede라고 합니다.

### 한 요청만 값을 다시 만들게 할 수 있다

Single-flight 또는 짧은 lock을 사용하면 한 요청만 원본 조회와 cache fill을 수행하고 나머지는 그 결과를 기다리게 할 수 있습니다.

```text
miss requests
   │
   ├─ fill owner ─▶ origin read ─▶ cache SET
   │
   └─ others ─────▶ wait / retry cache lookup
```

하지만 lock을 추가하면 새로운 상태가 생깁니다. fill owner가 죽었을 때 lock은 언제 풀리는지, 기다리는 요청은 얼마나 오래 대기할지, lock TTL이 너무 짧아 두 owner가 동시에 생기지는 않는지 정해야 합니다.

### 만료되기 전에 갱신할 수도 있다

오래된 값을 잠시 반환해도 되는 조회라면 entry가 완전히 사라지기 전에 한 요청이 background refresh를 시작하고 나머지는 기존 값을 계속 사용할 수 있습니다.

```text
아직 usable한 cached value
        │
        ├─ 대부분의 요청 → 기존 값 반환
        └─ refresh owner → origin에서 새 값 갱신
```

이 방식은 만료 순간의 폭주를 줄이지만 freshness 계약이 허용해야 합니다. 결제 상태처럼 오래된 값을 돌려주면 안 되는 데이터에 기계적으로 적용할 수는 없습니다.

### 대기 요청 자체도 자원이다

Origin query 수를 1개로 줄였어도 수천 요청이 하나의 fill 결과를 기다리며 worker나 connection을 붙잡으면 또 다른 병목이 생길 수 있습니다. 따라서 wait timeout과 동시 대기량도 bounded해야 합니다.

Stampede 대응의 목표는 lock을 넣는 것이 아니라 **동일한 재생성 작업의 중복을 제한하면서도 대기와 stale 비용을 통제하는 것**입니다. 어떤 전략이 필요한지는 key의 access skew, 재생성 비용, 허용 가능한 최신성부터 측정해 판단합니다.
