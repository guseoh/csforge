---
kind: concept
contentKey: computer-architecture.core.multicore-memory.cache-coherence-problem
topicContentKey: computer-architecture.core.multicore-memory
slug: cache-coherence-problem
title: "캐시 일관성 문제(Cache Coherence Problem)"
summary: "여러 코어의 캐시에 같은 메모리 라인 복사본이 있을 때 쓰기 이후 최신 값을 일관되게 유지해야 하는 문제를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/multiprocessors/index.html"
    title: "Multiprocessors"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "multicore cache sharing, coherence protocol, false sharing과 shared-memory ordering 경계를 확인한다."
    displayOrder: 1
---
# 캐시 일관성 문제(Cache Coherence Problem)

여러 코어가 같은 물리 캐시 라인을 읽으면 각 코어별 캐시에 그 라인의 복사본이 존재할 수 있다. 이후 Core A가 값을 수정했는데 Core B가 아무 조치 없이 이전 복사본을 계속 사용한다면 같은 메모리 위치에 대해 서로 다른 값을 최신이라고 보게 된다.

```text
Core A cache: line X = 10
Core B cache: line X = 10

Core A writes X = 20
→ B의 old copy를 그대로 두면 문제가 발생
```

캐시 일관성은 이런 **같은 라인의 여러 복사본을 일관되게 관리하는 문제**다.

### 쓰려면 다른 복사본과 조정해야 한다

무효화(invalidation) 기반 프로토콜을 단순화하면 한 코어가 공유 라인에 쓰기 전에 쓰기 권한을 얻고, 다른 캐시에 있는 복사본을 무효 상태로 만들 수 있다.

```text
A/B both have line X
       ↓
A wants to write
       ↓
B copy invalidated
       ↓
A obtains write ownership
```

이후 B가 다시 X를 읽으면 무효화된 복사본을 사용할 수 없으므로 캐시 일관성 요청을 통해 최신 데이터를 얻어야 한다.

### 캐시 일관성은 보통 캐시 라인 단위로 동작한다

프로그래머는 필드 하나를 수정한다고 생각하지만 하드웨어는 보통 캐시 라인 단위로 소유권과 상태를 관리한다. 그래서 같은 라인 안의 서로 다른 변수도 서로 영향을 줄 수 있다. 이것이 거짓 공유로 이어진다.

### 캐시 일관성이 모든 동시성 문제를 해결하지는 않는다

캐시 일관성은 같은 위치의 캐시 복사본을 일관되게 관리하지만 `x++` 같은 read-modify-write 연산 전체를 원자적으로 만들지는 않는다. 서로 다른 주소 사이의 순서도 캐시 일관성 하나만으로 정해지지 않는다.

즉 다음을 분리해야 한다.

```text
coherence  → 같은 line의 최신 copy와 permission
atomicity  → compound operation을 하나처럼 수행
ordering   → 여러 memory operation의 관찰 순서
```

다음 Concept에서는 실제 캐시 일관성 프로토콜이 라인마다 어떤 상태와 소유권을 추적하는지 본다.
