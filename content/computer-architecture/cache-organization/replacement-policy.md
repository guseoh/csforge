---
kind: concept
contentKey: computer-architecture.core.cache-organization.replacement-policy
topicContentKey: computer-architecture.core.cache-organization
slug: replacement-policy
title: "Cache 교체 정책"
summary: "set이 가득 찼을 때 어느 line을 내보낼지 결정하는 정책과 hit rate·구현 비용의 trade-off를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Cache 교체 정책

Set-associative 또는 fully-associative cache에서 새로운 line을 넣어야 하는데 후보 위치가 모두 사용 중이라면 기존 line 하나를 내보내야 한다. 이 victim line을 고르는 규칙이 replacement policy다.

### 최근 사용 정보를 이용할 수도 있다

LRU(Least Recently Used)는 가장 오래 사용되지 않은 line을 victim으로 선택해 temporal locality를 활용하려는 정책이다. 최근에 사용한 line은 다시 사용할 가능성이 높다고 가정하는 것이다.

하지만 associativity가 높아질수록 정확한 LRU 순서를 계속 추적하는 hardware 비용도 커진다. 그래서 실제 cache는 pseudo-LRU처럼 근사 정책이나 random에 가까운 정책을 사용할 수 있다.

### 좋은 정책도 capacity 한계를 없애지는 못한다

Working set이 set이 담을 수 있는 line 수보다 크면 어떤 replacement policy를 사용해도 eviction은 계속 발생한다. Policy는 어느 line을 내보낼지 더 나은 선택을 할 뿐 cache capacity 자체를 늘리지는 않는다.

Write-back cache에서는 dirty line을 victim으로 선택하면 lower level에 write-back하는 추가 비용이 생길 수 있다. 따라서 replacement는 hit rate뿐 아니라 eviction cost에도 영향을 준다.

### Replacement는 cache 조직의 일부다

Direct-mapped cache는 들어갈 위치가 하나뿐이므로 victim 선택 자체가 없다. Associativity가 생기면서 여러 후보 중 하나를 선택해야 하므로 replacement policy가 필요해진다.

즉 cache organization은 placement와 lookup만의 문제가 아니라 **새 line을 어디에 넣고, 자리가 없을 때 무엇을 내보낼 것인가**까지 포함한다.
