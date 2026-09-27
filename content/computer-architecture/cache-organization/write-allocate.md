---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-allocate
topicContentKey: computer-architecture.core.cache-organization
slug: write-allocate
title: "쓰기 할당(Write Allocate)"
summary: "쓰기 미스에서 해당 라인을 캐시로 가져올지 우회할지 결정하는 write-allocate와 no-write-allocate를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "direct-mapped·set-associative·fully-associative mapping, tag/index/offset, replacement과 write policy를 확인한다."
    displayOrder: 1
---
# 쓰기 할당(Write Allocate)

Write-through와 write-back은 **이미 캐시에 있는 라인을 수정했을 때** 하위 계층에 언제 반영할지를 정한다. 반면 write-allocate와 no-write-allocate는 **쓰려는 블록이 캐시에 없을 때** 무엇을 할지를 정한다.

두 정책은 서로 다른 선택 축이다.

### Write-allocate는 라인을 먼저 가져온다

Write-allocate에서는 쓰기 미스가 나면 해당 메모리 블록을 캐시 라인으로 가져온 뒤 대상 바이트나 워드를 수정한다.

```text
write miss
   ↓
lower level에서 line fill
   ↓
cache line 수정
```

같은 라인을 곧 다시 읽거나 여러 번 수정할 가능성이 높다면 지역성을 활용할 수 있다. 그래서 write-back 캐시와 잘 어울리는 경우가 많다.

대신 한 번만 쓰고 다시 사용하지 않을 데이터라도 라인 채우기 트래픽이 발생할 수 있다.

### No-write-allocate는 캐시에 넣지 않고 아래로 보낸다

No-write-allocate에서는 쓰기 미스가 난 블록을 캐시에 채우지 않고 하위 계층 쓰기 경로로 전달한다.

```text
write miss ──> cache fill 없음 ──> lower level write
```

한 번만 쓰는 스트리밍 작업 부하라면 불필요한 라인 채우기와 캐시 오염을 줄일 수 있다. 반대로 같은 블록을 곧 다시 읽거나 수정한다면 지역성 이점을 놓쳐 이후 접근에서 다시 미스가 날 수 있다.

### 쓰기 적중 정책과 미스 정책을 따로 생각한다

대표적으로 write-back + write-allocate, write-through + no-write-allocate 조합을 자주 설명하지만 이것을 모든 CPU의 고정 규칙으로 외울 필요는 없다. 핵심은 두 질문을 분리하는 것이다.

1. 캐시 쓰기 적중을 하위 계층에 언제 반영할 것인가?
2. 쓰기 미스에서 블록을 캐시에 가져올 것인가?

이 두 축을 분리하면 쓰기 정책의 동작을 훨씬 명확하게 이해할 수 있다.
