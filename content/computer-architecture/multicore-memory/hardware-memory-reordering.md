---
kind: concept
contentKey: computer-architecture.core.multicore-memory.hardware-memory-reordering
topicContentKey: computer-architecture.core.multicore-memory
slug: hardware-memory-reordering
title: "Hardware Memory Reordering"
summary: "hardware ordering과 Java Memory Model happens-before를 분리해 설명한다."
level: 3
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Hardware Memory Reordering

CPU와 compiler는 독립적으로 보이는 load/store를 내부적으로 재배치하거나 buffer에 보관할 수 있다. 다른 core가 보는 순서는 cache coherence만으로 모든 address의 program order를 보장하지 않으므로 fence와 atomic protocol이 필요하다.

중요한 경계는 `Hardware ordering ≠ Java Memory Model happens-before`다. hardware memory order는 구현 계층의 관찰 규칙이고, Java happens-before는 volatile·lock·thread start/join 같은 language action 사이에 정의된 추상 계약이다. JVM이 필요한 fence를 선택해 이 계약을 구현한다.

### Backend 연결

Java data race를 “x86은 순서가 강하다”로 고치지 않는다. 공유 state의 happens-before를 먼저 설계하고, native/FFI 경계에서는 양쪽 memory model과 fence 책임을 명시한다.
