---
kind: concept
contentKey: computer-architecture.core.cache-organization.set-associative-cache
topicContentKey: computer-architecture.core.cache-organization
slug: set-associative-cache
title: "집합 연관 캐시(Set-Associative Cache)"
summary: "하나의 세트 안에 여러 way를 두어 충돌 미스를 줄이는 대신 태그 비교와 교체 비용이 커지는 구조를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 집합 연관 캐시(Set-Associative Cache)

집합 연관 캐시는 캐시 라인을 여러 세트로 나누고, 각 세트 안에 여러 개의 way를 둔다. 주소의 인덱스는 세트 하나를 선택하지만 요청한 메모리 블록은 그 세트 안의 어느 way에도 들어갈 수 있다.

예를 들어 4-way 캐시라면 하나의 세트에 최대 네 라인을 둘 수 있다.

```text
address → set index → [way 0 | way 1 | way 2 | way 3]
                         │      │      │      │
                         └──── tag 비교 ──────┘
```

### 직접 사상보다 충돌을 줄일 수 있다

직접 사상 캐시에서는 같은 인덱스를 가진 두 블록이 라인 하나를 번갈아 차지한다. 4-way 캐시라면 같은 세트에 네 블록까지 함께 머물 수 있으므로 이런 충돌을 줄일 수 있다.

하지만 세트 안의 모든 way가 차 있고 새로운 블록을 넣어야 한다면 어느 way를 내보낼지 결정해야 한다. 그래서 연관도(associativity)가 1보다 큰 캐시에는 교체 정책이 필요하다.

### Way가 많을수록 공짜로 좋아지는 것은 아니다

Way 수가 늘면 충돌 미스는 줄어들 수 있지만 조회할 때 비교해야 할 태그 수와 선택 회로가 늘어난다. 교체 상태도 더 복잡해질 수 있다.

따라서 연관도는 충돌 미스와 적중 경로 비용 사이의 절충이다. 높은 연관도가 compulsory miss나 capacity miss까지 없애는 것은 아니다.

직접 사상, 집합 연관, 완전 연관 캐시는 결국 **메모리 블록을 캐시의 몇 개 위치 중 어디에 둘 수 있는가**라는 배치 자유도의 차이다.
