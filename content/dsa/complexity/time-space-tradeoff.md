---
kind: concept
contentKey: dsa.core.complexity.time-space-tradeoff
topicContentKey: dsa.core.complexity
slug: time-space-tradeoff
title: "Time-Space Trade-off"
summary: "추가 메모리로 시간을 줄이는 선택의 경계를 분석한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Time-Space Trade-off

방문 여부를 set에 저장하면 중복 탐색을 줄일 수 있고, prefix sum을 만들면 반복 구간합을 빠르게 답할 수 있다. 대신 `O(n)` 공간, 초기화 시간, cache pressure를 지불한다. 공간을 전혀 쓰지 않는 방법이 항상 낫지 않으며, memory limit과 data lifetime이 선택을 제한한다.

저장한 값이 입력 변경 뒤에도 유효한지와 eviction 시 재계산 비용을 확인해야 한다. cache가 stale해지면 시간 이득이 correctness를 침해할 수 있으므로 derived data와 source of truth를 분리한다.

### Backend 연결

request-level memoization과 process-wide cache를 선택할 때 hit율뿐 아니라 heap·GC·invalidation 비용을 측정한다. 큰 page cache가 downstream 부하를 줄여도 memory pressure로 tail latency를 악화시킬 수 있다.
