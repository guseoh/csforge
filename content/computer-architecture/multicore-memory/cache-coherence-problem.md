---
kind: concept
contentKey: computer-architecture.core.multicore-memory.cache-coherence-problem
topicContentKey: computer-architecture.core.multicore-memory
slug: cache-coherence-problem
title: "Cache Coherence Problem"
summary: "한 core의 write가 다른 cache copy와 충돌하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Cache Coherence Problem

Core A와 B가 같은 memory line을 각각 cache한 뒤 A가 값을 쓰면 B의 오래된 copy가 남을 수 있다. coherence protocol은 write의 ownership과 다른 copy의 invalidate/update를 추적해 같은 line에 대한 관찰이 모순되지 않도록 한다.

coherence는 한 address의 write visibility를 다루는 protocol이지 `x++` 전체가 atomic하다는 뜻이 아니다. 서로 다른 address 사이 순서, lock invariant, durable storage는 별도의 ordering·software 계약이다.

### Backend 연결

counter race를 cache coherence 탓으로만 설명하지 않는다. atomic instruction이나 lock의 language/OS semantics와 cache line traffic을 각각 검증한다.

