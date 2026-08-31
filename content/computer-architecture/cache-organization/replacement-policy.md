---
kind: concept
contentKey: computer-architecture.core.cache-organization.replacement-policy
topicContentKey: computer-architecture.core.cache-organization
slug: replacement-policy
title: "Replacement Policy"
summary: "eviction 대상 선택이 hit rate와 구현 비용에 미치는 영향을 비교한다."
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
# Replacement Policy

set이 가득 찼을 때 victim line을 고르는 정책이 replacement policy다. LRU는 최근 사용되지 않은 line을 버려 temporal locality를 기대하지만 상태 bits와 update 비용이 커지고, pseudo-LRU나 random은 덜 정확한 대신 hardware가 단순하다.

정책이 좋아도 working set이 set capacity를 넘으면 계속 eviction된다. dirty line을 쫓아내면 write-back이 추가되고, prefetch된 line은 실제로 쓰이지 않아 유효한 line을 밀어낼 수 있다.

### Backend 연결

cache miss 개선을 위해 eviction policy를 바꿀 때 hit rate와 traffic·전력·tail latency를 함께 비교한다. application LRU cache의 정책과 CPU cache replacement를 같은 configuration으로 취급하지 않는다.
