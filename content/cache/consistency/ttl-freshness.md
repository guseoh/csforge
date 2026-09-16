---
kind: concept
contentKey: cache.core.consistency.ttl-freshness
topicContentKey: cache.core.consistency
slug: ttl-freshness
title: "TTL과 최신성 허용 범위"
summary: "TTL을 단순 만료 시간으로 보지 않고 업무가 허용하는 stale window, 변경 빈도, 재생성 비용과 연결해 정한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://redis.io/docs/latest/develop/use-cases/cache-aside/"
    title: "Redis Documentation: Cache Aside"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: "per-key TTL과 bounded staleness 설명 확인"
---
# TTL과 최신성 허용 범위

TTL(Time To Live)은 cache entry가 **얼마 동안 존재할 수 있는지** 제한하는 기술 수단입니다. 하지만 “TTL이 60초이므로 데이터는 항상 60초 이내로 최신이다”라고 단순화하면 안 됩니다. 원본이 언제 바뀌었는지와 캐시가 언제 만들어졌는지에 따라 실제 오래된 정도는 달라집니다.

```text
cache fill at t=0
origin update at t=20
cache expires at t=60

→ invalidation이 없다면 t=20~60 동안 이전 값을 반환할 수 있음
```

따라서 TTL을 정하기 전에 **이 데이터가 얼마 동안 오래되어도 괜찮은가**를 제품 의미로 정해야 합니다.

### 데이터마다 허용 가능한 최신성이 다르다

변경이 드문 카테고리 설명은 몇 분 정도 이전 값이어도 문제가 작을 수 있습니다. 반면 사용자가 방금 제출한 학습 결과나 권한 상태처럼 즉시 반영되어야 하는 값은 같은 TTL을 적용하기 어렵습니다.

```text
변경이 드문 조회 데이터
→ 긴 TTL을 검토할 수 있음

방금 바뀐 개인 상태
→ 짧은 TTL / 즉시 invalidation / cache bypass 검토
```

TTL은 cache server 설정 하나가 아니라 key 종류별 freshness contract가 될 수 있습니다.

### invalidation 실패의 안전망으로 사용할 수 있다

원본 변경 뒤 cache key를 즉시 삭제하더라도 network 오류나 process 장애로 삭제가 실패할 수 있습니다. TTL이 있으면 오래된 값이 무기한 남는 것은 막을 수 있습니다.

```text
DB commit
  ├─ DEL 성공 → 다음 read는 miss 후 최신 값 재생성
  └─ DEL 실패 → TTL 종료 전까지 old value 가능
```

따라서 TTL은 invalidation을 대신하는 것이 아니라 **실패했을 때 stale 상태가 지속되는 시간을 제한하는 보조 장치**로 볼 수 있습니다.

### 너무 짧은 TTL도 비용이 있다

TTL을 무조건 짧게 잡으면 cache miss가 많아지고 원본 저장소 조회가 늘어납니다. 인기 key가 비슷한 시각에 함께 만료되면 순간적으로 DB 요청이 폭증할 수도 있습니다. 이런 workload에서는 만료 시각에 작은 jitter를 섞거나 미리 갱신하는 전략을 검토할 수 있습니다.

좋은 TTL은 hit ratio 하나를 최대화하는 숫자가 아니라 **오래된 값을 허용할 시간과 원본 조회 비용 사이의 균형점**입니다.
