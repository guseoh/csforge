---
kind: concept
contentKey: computer-architecture.core.cache-organization.write-allocate
topicContentKey: computer-architecture.core.cache-organization
slug: write-allocate
title: "Write Allocate"
summary: "write miss에서 해당 line을 cache로 가져올지 bypass할지 결정하는 write-allocate와 no-write-allocate를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/cache-organization/index.html"
    title: "Cache Organization"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "access pattern과 cache line 재사용을 확인한다."
    displayOrder: 1
---
# Write Allocate

Write-through와 write-back은 **이미 cache에 있는 line을 수정했을 때** lower level에 언제 반영할지를 정한다. 반면 write-allocate와 no-write-allocate는 **write하려는 block이 cache에 없을 때** 무엇을 할지를 정한다.

두 정책은 서로 다른 선택 축이다.

### Write-allocate는 line을 먼저 가져온다

Write-allocate에서는 write miss가 나면 해당 memory block을 cache line으로 가져온 뒤 target byte나 word를 수정한다.

```text
write miss
   ↓
lower level에서 line fill
   ↓
cache line 수정
```

같은 line을 곧 다시 읽거나 여러 번 수정할 가능성이 높다면 locality를 활용할 수 있다. 그래서 write-back cache와 잘 어울리는 경우가 많다.

대신 한 번만 쓰고 다시 사용하지 않을 data라도 line fill traffic이 발생할 수 있다.

### No-write-allocate는 cache에 넣지 않고 아래로 보낸다

No-write-allocate에서는 write miss가 난 block을 cache에 채우지 않고 lower-level write path로 전달한다.

```text
write miss ──> cache fill 없음 ──> lower level write
```

한 번만 쓰는 streaming workload라면 불필요한 line fill과 cache pollution을 줄일 수 있다. 반대로 같은 block을 곧 다시 읽거나 수정한다면 locality 이점을 놓쳐 이후 access에서 다시 miss가 날 수 있다.

### Write hit 정책과 miss 정책을 따로 생각한다

대표적으로 write-back + write-allocate, write-through + no-write-allocate 조합을 자주 설명하지만 이것을 모든 CPU의 고정 규칙으로 외울 필요는 없다. 핵심은 두 질문을 분리하는 것이다.

1. cache hit write를 lower level에 언제 반영할 것인가?
2. cache miss write에서 block을 cache에 가져올 것인가?

이 두 축을 분리하면 write policy의 동작을 훨씬 명확하게 이해할 수 있다.
