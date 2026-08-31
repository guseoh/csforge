---
kind: concept
contentKey: computer-architecture.core.multicore-memory.multicore-shared-memory
topicContentKey: computer-architecture.core.multicore-memory
slug: multicore-shared-memory
title: "Multicore Shared Memory"
summary: "여러 core가 같은 memory를 읽고 쓰는 구조를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Multicore Shared Memory

여러 core는 같은 physical memory를 주소로 사용할 수 있지만 각 core의 register와 cache는 private state일 수 있다. 한 core의 store를 다른 core가 언제 어떤 값으로 관찰하는지는 cache coherence와 memory ordering protocol이 함께 결정한다.

공유 memory는 message copy 없이 communication할 수 있지만 shared mutable state와 synchronization 책임이 생긴다. coherence가 있다고 해서 여러 instruction의 원자성이나 application invariant까지 자동으로 보장되는 것은 아니다.

### Backend 연결

thread pool과 lock contention을 분석할 때 cache line invalidation과 scheduler 대기를 분리한다. Java의 happens-before는 hardware 관찰 순서보다 높은 language 계약이므로 두 층을 섞지 않는다.
