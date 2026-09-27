---
kind: concept
contentKey: computer-architecture.core.cache-organization.replacement-policy
topicContentKey: computer-architecture.core.cache-organization
slug: replacement-policy
title: "캐시 교체 정책(Cache Replacement Policy)"
summary: "세트가 가득 찼을 때 어느 라인을 내보낼지 결정하는 정책과 적중률·구현 비용의 절충을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 캐시 교체 정책(Cache Replacement Policy)

집합 연관 또는 완전 연관 캐시에서 새로운 라인을 넣어야 하는데 후보 위치가 모두 사용 중이라면 기존 라인 하나를 내보내야 한다. 이 교체 대상을 고르는 규칙이 교체 정책이다.

### 최근 사용 정보를 이용할 수도 있다

LRU(Least Recently Used)는 가장 오래 사용되지 않은 라인을 교체 대상으로 선택해 시간적 지역성을 활용하려는 정책이다. 최근에 사용한 라인은 다시 사용할 가능성이 높다고 가정하는 것이다.

하지만 연관도가 높아질수록 정확한 LRU 순서를 계속 추적하는 하드웨어 비용도 커진다. 그래서 실제 캐시는 pseudo-LRU처럼 근사 정책이나 무작위에 가까운 정책을 사용할 수 있다.

### 좋은 정책도 용량 한계를 없애지는 못한다

작업 집합이 세트가 담을 수 있는 라인 수보다 크면 어떤 교체 정책을 사용해도 교체는 계속 발생한다. 정책은 어느 라인을 내보낼지 더 나은 선택을 할 뿐 캐시 용량 자체를 늘리지는 않는다.

Write-back 캐시에서는 dirty 라인을 교체 대상으로 선택하면 하위 계층에 write-back하는 추가 비용이 생길 수 있다. 따라서 교체 정책은 적중률뿐 아니라 교체 비용에도 영향을 준다.

### 교체 정책은 캐시 구성의 일부다

직접 사상 캐시는 들어갈 위치가 하나뿐이므로 교체 대상 선택 자체가 없다. 연관도가 생기면서 여러 후보 중 하나를 선택해야 하므로 교체 정책이 필요해진다.

즉 캐시 구성은 배치와 조회만의 문제가 아니라 **새 라인을 어디에 넣고, 자리가 없을 때 무엇을 내보낼 것인가**까지 포함한다.
