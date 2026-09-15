---
kind: concept
contentKey: computer-architecture.core.multicore-memory.private-shared-cache
topicContentKey: computer-architecture.core.multicore-memory
slug: private-shared-cache
title: "Private Cache와 Shared Cache"
summary: "core-private cache와 shared lower-level cache를 조합할 때 지연 시간·capacity·contention·coherence traffic이 어떻게 달라지는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache 복사본의 coherence 문제를 확인한다."
    displayOrder: 1
---
# Private Cache와 Shared Cache

Multicore CPU는 cache level마다 다른 sharing 구조를 사용할 수 있다. 작은 상위 cache는 각 core에 private하게 두고, 더 큰 lower-level cache는 여러 core가 공유하는 식의 구성이 대표적이다.

```text
core A → private cache ─┐
core B → private cache ─┼─> shared lower-level cache → memory
core C → private cache ─┘
```

실제 level 구성은 CPU마다 다르므로 `L1은 항상 private, L3는 항상 shared`처럼 고정된 규칙으로 외우면 안 된다.

### Private cache는 낮은 latency와 per-core locality에 유리하다

Core 가까이에 있는 private cache는 다른 core의 lookup과 매번 경쟁하지 않고 자기 working set을 빠르게 재사용할 수 있다.

대신 같은 physical cache line이 여러 private cache에 복사될 수 있다. 여러 core가 shared writable data를 접근한다면 이 복사본을 일관되게 관리하기 위해 coherence protocol이 필요하다.

### Shared cache는 capacity를 함께 쓸 수 있다

Shared lower-level cache는 여러 core가 큰 capacity를 공동으로 사용할 수 있다. 한 core가 적게 쓰는 동안 다른 core가 더 많은 line을 사용할 수 있다는 장점이 있다.

반면 여러 core가 같은 cache의 bank, port, interconnect와 capacity를 경쟁하므로 contention과 interference가 생길 수 있다.

### Sharing 구조는 locality와 coherence 비용을 함께 바꾼다

Thread가 다른 core로 이동하면 이전 core의 private cache에 있던 warm state를 그대로 사용할 수 없을 수 있다. Correctness는 coherence로 유지되더라도 cache locality가 달라져 성능이 바뀔 수 있다.

반대로 모든 data를 shared cache에 둔다고 해서 coherence 비용이 사라지는 것도 아니다. Writable line의 ownership이 core 사이를 이동해야 한다면 private cache와 shared hierarchy 모두에서 추가 traffic이 생길 수 있다.

따라서 private/shared cache는 `어느 쪽이 더 좋은가`의 문제가 아니라 **latency, capacity, interference, sharing pattern 사이의 trade-off**로 본다.
