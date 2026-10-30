---
kind: concept
contentKey: cache.core.operations.hot-key
topicContentKey: cache.core.operations
slug: hot-key
title: "핫 키와 접근 편향"
summary: "특정 키에 요청이 집중되면 캐시 히트 상황에서도 한 노드·네트워크 경로·연결이 병목이 될 수 있음을 이해하고 읽기 분산의 최신성 비용을 판단한다."
level: 3
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/"
    title: "Redis Documentation: Redis cluster specification"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "키의 해시 슬롯 배치와 동일 키 읽기 분산의 경계 확인"
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Redis cache-aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: "반복 조회와 캐시 접근 패턴 확인"
---
# 핫 키와 접근 편향

캐시 적중률이 높아도 캐시 자체가 병목이 될 수 있습니다. 요청 대부분이 하나의 인기 키에 몰리면 그 키가 위치한 노드와 네트워크 경로, 연결에 트래픽이 집중되기 때문입니다.

```text
10,000 requests
        │
        └─ featured:today
               │
               ▼
          Redis shard A
```

### 샤드를 늘려도 같은 키는 한 위치에 남을 수 있다

키 기반 샤딩은 보통 키의 해시 값을 이용해 저장 위치를 정합니다. 따라서 서로 다른 키는 여러 노드에 나뉘지만 **같은 키를 향한 요청 자체가 자동으로 여러 샤드로 분산되지는 않습니다.** Redis Cluster에서도 동일한 키는 하나의 해시 슬롯을 기준으로 라우팅됩니다.

이 점 때문에 핫 키 문제는 “클러스터 노드를 늘리면 해결된다”로 단순화할 수 없습니다.

### 복제하면 읽기는 분산되지만 최신성 비용이 생긴다

아주 자주 읽고 조금 오래되어도 괜찮은 값이라면 애플리케이션 로컬 캐시, 읽기 복제본(read replica), 의도적으로 복제한 캐시 키를 검토할 수 있습니다.

```text
인기 값
   ├─ 로컬 캐시 A
   ├─ 로컬 캐시 B
   └─ 공유 Redis
```

하지만 복사본이 많아질수록 쓰기와 무효화가 더 복잡해집니다. 여러 인스턴스의 로컬 캐시를 얼마나 빨리 지울 수 있는지, 복제본이 얼마나 오래된 값을 반환할 수 있는지 먼저 확인해야 합니다.

### 캐시 스탬피드와는 다른 문제다

캐시 스탬피드는 키가 만료되어 여러 요청이 동시에 **캐시 미스**를 만나 원본 조회를 반복하는 문제입니다. 핫 키는 캐시가 정상적으로 **히트**하고 있어도 특정 저장 위치에 요청이 몰리는 문제입니다.

```text
핫 키          → 히트 트래픽 자체가 한 지점에 집중
캐시 스탬피드 → 미스 순간 재생성 작업이 중복
```

같은 인기 키에서 두 문제가 함께 나타날 수 있지만 관측해야 할 지표와 해결책은 다릅니다.

핫 키를 다룰 때는 전체 QPS만 보지 말고 **키별·노드별 트래픽 편향과 CPU·네트워크 사용량**을 함께 봐야 합니다. 복제를 선택한다면 성능 이득과 함께 오래된 값·무효화 비용까지 제품 요구에 맞는지 판단해야 합니다.
