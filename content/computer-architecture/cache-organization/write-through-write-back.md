---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-through-write-back
topicContentKey: computer-architecture.core.cache-organization
slug: write-through-write-back
title: "쓰기 반영 시점: Write-Through와 Write-Back"
summary: "캐시 쓰기 적중을 하위 계층에 언제 반영할지 결정하는 두 정책의 쓰기 트래픽·dirty 교체 비용을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 쓰기 반영 시점: Write-Through와 Write-Back

CPU가 캐시에 있는 라인을 수정하면 상위 캐시와 하위 메모리 계층 사이에 값이 달라질 수 있다. Write-through와 write-back은 **쓰기 적중이 발생했을 때 하위 계층에 변경을 언제 반영할지** 정하는 대표 정책이다.

### Write-through는 매 쓰기를 아래 계층에도 전달한다

Write-through 캐시는 캐시 라인을 수정하면서 같은 쓰기를 다음 메모리 계층에도 전달한다.

```text
CPU write
   ├─ cache update
   └─ lower level write
```

하위 계층이 빠르게 최신 값을 받는다는 장점이 있지만, 같은 라인을 여러 번 수정하면 쓰기 트래픽도 반복해서 발생한다. 실제 하드웨어는 write buffer를 사용해 CPU가 모든 하위 계층 쓰기 완료를 매번 직접 기다리지 않도록 할 수 있다.

### Write-back은 캐시에서 수정한 뒤 나중에 내보낸다

Write-back 캐시는 쓰기 적중에서 캐시 복사본만 수정하고 dirty 상태를 표시한다. 같은 라인을 여러 번 수정해도 하위 계층에는 매번 쓰지 않고, 라인이 교체될 때 수정된 내용을 write-back할 수 있다.

```text
CPU write → cache line 수정 + dirty 표시
                         │
                         └─ eviction 시 lower level에 write-back
```

쓰기 트래픽을 줄일 수 있지만 dirty 라인을 교체할 때 추가 비용이 생긴다. 또한 하위 계층이 잠시 이전 값을 가지고 있을 수 있으므로 캐시 일관성 같은 다른 하드웨어 메커니즘과 함께 동작해야 한다.

### 이 정책은 저장장치의 영속성과 다른 문제다

CPU 캐시에서 write-back한다는 말은 데이터베이스 commit이나 디스크 영속성을 뜻하지 않는다. 여기서 다루는 것은 **휘발성 하드웨어 메모리 계층 안에서 수정된 캐시 라인을 언제 다음 계층에 전달하는가**라는 문제다.

쓰기 적중 정책과 쓰기 미스 정책도 다른 축이다. 다음 Concept에서는 쓰려는 블록이 캐시에 없을 때 라인을 먼저 가져올지 결정하는 write-allocate를 본다.
