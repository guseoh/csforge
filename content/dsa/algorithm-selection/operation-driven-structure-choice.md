---
kind: concept
contentKey: dsa.core.algorithm-selection.operation-driven-structure-choice
topicContentKey: dsa.core.algorithm-selection
slug: operation-driven-structure-choice
title: "Operation-Driven Structure Choice"
summary: "주요 operation 빈도와 invariant로 자료구조를 선택한다."
level: 2
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/14analysis/"
    title: "Algorithms, 4th Edition: Analysis of Algorithms"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "입력 제약과 알고리즘 선택 기준을 확인한다."
    displayOrder: 1
---
# Operation-Driven Structure Choice

자료구조 선택은 add, lookup, delete, min/max, range query 중 어떤 operation이 얼마나 자주 필요한지와 어떤 invariant를 유지할지에서 시작한다. 배열의 locality, hash의 평균 lookup, tree의 ordering, heap의 priority처럼 장점의 조건이 서로 다르다.

모든 operation을 동시에 최적으로 만들 수 없으므로 workload와 consistency를 우선순위로 둔다. library 이름보다 worst-case, memory layout, iteration order, concurrency와 update semantics를 비교한다.

### Backend 연결

content key lookup과 ordered pagination, prefix search는 서로 다른 query shape다. repository query와 index를 operation별로 설계하고 실제 query plan과 page latency로 검증한다.

