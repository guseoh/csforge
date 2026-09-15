---
kind: concept
contentKey: cache.core.models.cache-aside
topicContentKey: cache.core.models
slug: cache-aside
title: "Cache-Aside의 읽기와 쓰기 흐름"
summary: "애플리케이션이 캐시를 먼저 확인하고 miss이면 원본 저장소에서 값을 읽어 채우는 흐름과, 원본 변경 뒤 캐시를 무효화할 때 생기는 최신성 경계를 이해한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "cache-aside read miss, TTL, origin write와 invalidation 흐름 확인"
---
# Cache-Aside의 읽기와 쓰기 흐름

캐시는 원본 데이터를 대신하는 저장소가 아니라 **자주 읽는 값을 더 가까운 곳에 복사해 두는 파생 저장소**로 사용할 수 있습니다. Cache-Aside에서는 애플리케이션이 캐시 사용 순서를 직접 제어합니다. 먼저 캐시를 확인하고, 값이 없으면 PostgreSQL 같은 원본 저장소를 조회한 뒤 결과를 캐시에 채웁니다.

```text
조회 요청
   │
   ▼
캐시 조회
   ├─ hit  ───────────────▶ 값 반환
   │
   └─ miss
        │
        ▼
     원본 조회
        │
        ├─ 없음 ──────────▶ not found 처리
        └─ 있음 ─▶ 캐시 저장 ─▶ 값 반환
```

여기서 `hit`은 **요청한 key가 캐시에 존재했다**는 뜻입니다. 그 값이 반드시 최신이라는 뜻은 아닙니다. 원본이 변경된 뒤 캐시 무효화가 실패했다면 cache hit이면서 오래된 값일 수 있습니다. 반대로 miss는 캐시에 값이 없다는 뜻일 뿐 원본 데이터까지 없다는 의미는 아닙니다.

### 원본을 먼저 바꾸고 캐시는 뒤따르게 한다

PostgreSQL이 canonical data를 소유하는 구조라면 쓰기 성공 여부는 원본 저장소를 기준으로 판단하는 편이 자연스럽습니다.

```text
원본 DB UPDATE + COMMIT
          │
          ▼
관련 캐시 key 삭제
```

캐시 삭제에 성공하면 다음 조회는 miss가 되고 최신 원본 값을 다시 채울 수 있습니다. 삭제가 실패하면 TTL이 끝날 때까지 이전 값이 남을 수 있으므로, 원본 commit과 캐시 무효화가 하나의 원자적 transaction이라고 생각하면 안 됩니다.

캐시를 먼저 지우는 순서도 항상 안전한 것은 아닙니다. 캐시를 지운 뒤 DB 변경이 실패하면 다른 요청이 이전 원본 값을 다시 읽어 캐시에 채울 수 있습니다. 따라서 캐시를 사용하면 **원본 변경과 파생 값 갱신 사이에 작은 불일치 구간이 생길 수 있음**을 받아들이고 그 범위를 설계해야 합니다.

### 캐시가 사라져도 정답을 복원할 수 있어야 한다

Cache-Aside에서 캐시 entry는 eviction이나 Redis 재시작으로 사라질 수 있습니다. 그래도 원본 저장소가 살아 있다면 다시 만들 수 있어야 합니다.

```text
Redis data loss
   │
   └─ 캐시 miss 증가
          │
          ▼
      PostgreSQL에서 재생성
```

그래서 주문의 canonical 상태나 학습 이력처럼 잃으면 안 되는 데이터를 캐시에만 두는 것은 Cache-Aside의 역할과 맞지 않습니다. 캐시는 읽기 비용을 줄이는 장치이고, 데이터 정합성의 최종 책임은 원본 저장소에 남아 있습니다.

Cache-Aside를 이해할 때는 hit ratio보다 먼저 **무엇이 원본인지, miss가 났을 때 어디에서 다시 만들 수 있는지, 원본 변경 뒤 오래된 값이 얼마나 남아도 되는지**를 확인해야 합니다.
