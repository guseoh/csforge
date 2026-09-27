---
kind: concept
contentKey: computer-architecture.core.multicore-memory.private-shared-cache
topicContentKey: computer-architecture.core.multicore-memory
slug: private-shared-cache
title: "코어별 캐시와 공유 캐시(Private and Shared Cache)"
summary: "코어별 캐시와 공유 하위 캐시를 조합할 때 지연 시간·용량·경합·캐시 일관성 트래픽이 어떻게 달라지는지 설명한다."
level: 2
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "multicore cache sharing, coherence protocol, false sharing과 shared-memory ordering 경계를 확인한다."
    displayOrder: 1
---
# 코어별 캐시와 공유 캐시(Private and Shared Cache)

멀티코어 CPU는 캐시 계층마다 다른 공유 구조를 사용할 수 있다. 작은 상위 캐시는 각 코어에 독립적으로 두고, 더 큰 하위 캐시는 여러 코어가 공유하는 식의 구성이 대표적이다.

```text
core A → private cache ─┐
core B → private cache ─┼─> shared lower-level cache → memory
core C → private cache ─┘
```

실제 계층 구성은 CPU마다 다르므로 `L1은 항상 private, L3는 항상 shared`처럼 고정된 규칙으로 외우면 안 된다.

### 코어별 캐시는 낮은 지연 시간과 코어 지역성에 유리하다

코어 가까이에 있는 캐시는 다른 코어의 조회와 매번 경쟁하지 않고 자기 작업 집합을 빠르게 재사용할 수 있다.

대신 같은 물리 캐시 라인이 여러 코어별 캐시에 복사될 수 있다. 여러 코어가 쓰기 가능한 공유 데이터에 접근한다면 이 복사본을 일관되게 관리하기 위해 캐시 일관성 프로토콜이 필요하다.

### 공유 캐시는 용량을 함께 쓸 수 있다

공유 하위 캐시는 여러 코어가 큰 용량을 공동으로 사용할 수 있다. 한 코어가 적게 쓰는 동안 다른 코어가 더 많은 라인을 사용할 수 있다는 장점이 있다.

반면 여러 코어가 같은 캐시의 bank, port, interconnect와 용량을 경쟁하므로 경합과 간섭이 생길 수 있다.

### 공유 구조는 지역성과 일관성 비용을 함께 바꾼다

스레드가 다른 코어로 이동하면 이전 코어의 캐시에 남아 있던 예열 상태를 그대로 사용할 수 없을 수 있다. 정확성은 캐시 일관성으로 유지되더라도 지역성이 달라져 성능이 바뀔 수 있다.

반대로 모든 데이터를 공유 캐시에 둔다고 해서 캐시 일관성 비용이 사라지는 것도 아니다. 쓰기 가능한 라인의 소유권이 코어 사이를 이동해야 한다면 여러 캐시 계층에서 추가 트래픽이 생길 수 있다.

따라서 코어별/공유 캐시는 `어느 쪽이 더 좋은가`의 문제가 아니라 **지연 시간, 용량, 간섭, 공유 패턴 사이의 절충**로 본다.
