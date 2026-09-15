---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-hit-miss
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-hit-miss
title: "Cache Hit과 Miss"
summary: "cache lookup이 hit 또는 miss로 갈리는 조건과 miss 뒤 lower-level access 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "cache hit·miss와 lower-level access를 확인한다."
    displayOrder: 1
---
# Cache Hit과 Miss

CPU가 memory address를 요청하면 cache는 해당 주소의 memory block이 현재 cache에 있는지 확인한다. 요청한 block과 일치하는 valid line을 찾으면 **hit**, 찾지 못하면 **miss**다.

Hit라면 가까운 cache에서 바로 data를 사용할 수 있다. Miss라면 다음 memory level에서 필요한 block을 가져와 cache line을 채운 뒤 원래 access를 계속해야 한다.

```text
memory access
    │
    ├─ line found  → hit  → data 사용
    │
    └─ not found   → miss → lower level → line fill → 재개
```

### Miss가 나면 기존 line을 내보내야 할 수도 있다

새 line을 넣을 빈 자리가 없다면 기존 line 중 하나를 victim으로 선택해야 한다. Write-back cache에서 그 victim이 수정된 dirty line이라면 lower level에 변경 내용을 반영하는 과정도 필요할 수 있다.

그래서 miss의 실제 비용은 단순히 `다음 memory를 한 번 읽는 시간`보다 클 수 있다.

### Miss는 원인에 따라 나눠 볼 수 있다

처음 접근한 block이라 cache에 한 번도 없었던 경우를 compulsory 또는 cold miss라고 한다. Working set이 cache 용량보다 커서 이전 line이 밀려난 뒤 다시 필요한 경우는 capacity miss다. Cache 전체에 자리가 있어도 여러 block이 같은 위치를 경쟁하며 서로 밀어내면 conflict miss가 생길 수 있다.

이 구분은 원인 분석에 유용하다. Cache를 크게 만드는 것이 모든 miss를 없애지는 못하며, mapping이나 associativity가 문제인 conflict miss는 다른 접근이 필요하다.

### Hit rate만으로 전체 비용을 알 수 없다

Hit가 자주 나더라도 드문 miss 하나가 매우 비싸면 평균 접근 시간에 큰 영향을 줄 수 있다. 따라서 cache를 볼 때는 hit rate뿐 아니라 hit time과 miss penalty도 함께 봐야 한다.

다음 Concept에서는 memory system의 `한 번 기다리는 시간`과 `단위 시간당 옮길 수 있는 양`을 구분한다.
