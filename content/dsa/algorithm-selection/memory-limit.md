---
kind: concept
contentKey: dsa.core.algorithm-selection.memory-limit
topicContentKey: dsa.core.algorithm-selection
slug: memory-limit
title: "Memory Limit"
summary: "시간 개선을 위한 추가 메모리가 실제 제한을 넘는 조건을 판단한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Memory Limit

hash table, memo table, index처럼 extra memory로 시간을 줄이는 선택은 실제 memory budget 안에서만 유효하다. payload, object overhead, allocator, cache와 함께 peak memory를 계산해야 한다.

메모리를 줄이면 CPU와 I/O가 늘 수 있고, memory를 늘리면 GC·eviction·container OOM 위험이 커질 수 있다. 평균 크기보다 최악 batch와 동시 요청을 포함해 판단한다.

### Backend 연결

in-memory dedup set과 DB unique constraint를 비교할 때 JVM heap과 PostgreSQL memory를 별도 예산으로 본다. unbounded key 저장은 성능 최적화가 아니라 장애 원인이 될 수 있다.

