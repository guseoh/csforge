---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-line
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-line
title: "캐시 라인(Cache Line)"
summary: "캐시가 연속 바이트를 라인 단위로 이동·저장하는 이유와 라인 크기의 절충을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "memory hierarchy, temporal/spatial locality, cache line, hit/miss와 AMAT 관계를 확인한다."
    displayOrder: 1
---
# 캐시 라인(Cache Line)

CPU 캐시는 보통 요청한 바이트 하나만 저장하지 않는다. 일정 크기의 연속된 메모리 블록을 **캐시 라인** 단위로 가져와 보관한다.

예를 들어 라인 크기가 64바이트라면 주소 하나를 읽다가 미스가 났을 때 그 주소가 포함된 64바이트 블록을 다음 메모리 계층에서 가져올 수 있다. 이후 가까운 주소를 읽으면 이미 같은 라인 안에 있어 적중할 가능성이 높다. 이것이 공간적 지역성을 활용하는 방식이다.

```text
requested byte
      ↓
[--------- one cache line ---------]
| neighboring bytes are filled too |
```

### 라인 안에는 데이터뿐 아니라 상태도 필요하다

캐시는 라인에 담긴 데이터가 어느 메모리 블록에서 왔는지 구분해야 한다. 그래서 데이터와 함께 tag, valid bit 같은 메타데이터를 관리한다. Write-back 캐시라면 수정 여부를 나타내는 dirty 상태도 필요할 수 있다.

주소의 일부 비트는 라인 내부 위치를 고르는 오프셋으로 사용되고, 캐시 구조에 따라 set과 tag를 찾는 데 다른 비트가 사용된다. 이 세부 구조는 다음 Cache Organization Topic에서 더 자세히 다룬다.

### 라인이 크다고 항상 좋은 것은 아니다

큰 라인은 한 번의 미스로 더 많은 인접 데이터를 가져와 공간적 지역성을 활용할 수 있다. 하지만 실제로 사용하지 않을 바이트까지 가져오면 메모리 대역폭과 캐시 공간을 낭비한다.

또한 같은 캐시 용량에서 라인이 커지면 동시에 보관할 수 있는 라인 수는 줄어든다. 따라서 라인 크기는 지역성 활용과 전송 비용·용량 사이의 절충이다.

멀티코어에서는 캐시 일관성도 흔히 캐시 라인 단위로 관리된다. 서로 다른 변수가 같은 라인에 있을 때 생기는 거짓 공유는 뒤의 멀티코어 Topic에서 다룬다.
