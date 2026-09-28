---
kind: concept
contentKey: computer-architecture.core.memory-hierarchy.cache-hit-miss
topicContentKey: computer-architecture.core.memory-hierarchy
slug: cache-hit-miss
title: "캐시 적중과 미스(Cache Hit and Miss)"
summary: "캐시 조회가 적중 또는 미스로 갈리는 조건과 미스 뒤 하위 계층 접근 흐름을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://www.cs.umd.edu/~meesh/411/CA-online/chapter/memory-hierarchy-design/index.html"
    title: "Memory Hierarchy Design"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "memory hierarchy, temporal/spatial locality, cache line, hit/miss와 AMAT 관계를 확인한다."
    displayOrder: 1
---
# 캐시 적중과 미스(Cache Hit and Miss)

CPU가 메모리 주소를 요청하면 캐시는 해당 주소의 메모리 블록이 현재 캐시에 있는지 확인한다. 요청한 블록과 일치하는 유효 라인을 찾으면 **적중(hit)**, 찾지 못하면 **미스(miss)**다.

적중이라면 가까운 캐시에서 바로 데이터를 사용할 수 있다. 미스라면 다음 메모리 계층에서 필요한 블록을 가져와 캐시 라인을 채운 뒤 원래 접근을 계속해야 한다.

```text
memory access
    │
    ├─ line found  → hit  → data 사용
    │
    └─ not found   → miss → lower level → line fill → 재개
```

### 미스가 나면 기존 라인을 내보내야 할 수도 있다

새 라인을 넣을 빈 자리가 없다면 기존 라인 중 하나를 교체 대상으로 선택해야 한다. Write-back 캐시에서 그 라인이 수정된 dirty 상태라면 하위 계층에 변경 내용을 반영하는 과정도 필요할 수 있다.

그래서 미스의 실제 비용은 단순히 `다음 메모리를 한 번 읽는 시간`보다 클 수 있다.

### 미스는 원인에 따라 나눠 볼 수 있다

처음 접근한 블록이라 캐시에 한 번도 없었던 경우를 compulsory 또는 cold miss라고 한다. 작업 집합이 캐시 용량보다 커서 이전 라인이 밀려난 뒤 다시 필요한 경우는 capacity miss다. 캐시 전체에 자리가 있어도 여러 블록이 같은 위치를 경쟁하며 서로 밀어내면 conflict miss가 생길 수 있다.

이 구분은 원인 분석에 유용하다. 캐시를 크게 만드는 것이 모든 미스를 없애지는 못하며, 매핑이나 연관도가 문제인 conflict miss는 다른 접근이 필요하다.

### 적중률만으로 전체 비용을 알 수 없다

적중이 자주 나더라도 드문 미스 하나가 매우 비싸면 평균 접근 시간에 큰 영향을 줄 수 있다. 따라서 캐시를 볼 때는 적중률뿐 아니라 적중 시간과 미스 패널티도 함께 봐야 한다.

다음 Concept에서는 메모리 시스템의 `한 번 기다리는 시간`과 `단위 시간당 옮길 수 있는 양`을 구분한다.
