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
    recommendation: "입력 크기와 basic operation count를 기준으로 linear scan 비용을 분석한다."
    displayOrder: 1
---
# Operation-Driven Structure Choice

자료구조 선택은 어떤 구조가 가장 빠른지를 묻는 문제가 아니라 **어떤 operation을 얼마나 자주 수행하고 어떤 invariant를 유지해야 하는지**를 묻는 문제다.

Exact lookup이 대부분이라면 hash table이 후보가 될 수 있고, ordered traversal이나 range query가 중요하면 balanced tree가 자연스럽다. 최소값이나 최대값을 반복해서 꺼내는 작업이 핵심이면 heap 기반 priority queue가 적합할 수 있다.

```text
exact lookup  많음 → hash table 후보
range/order   필요 → balanced tree 후보
repeated min/max → heap 후보
prefix query  많음 → trie 후보
```

Operation 하나의 Big-O만 비교해서는 부족하다. Insert/delete 비율, duplicate 허용 여부, ordering 필요성, memory overhead처럼 구조가 유지해야 하는 조건도 함께 봐야 한다.

모든 operation을 동시에 최적으로 만드는 단일 자료구조는 드물다. 따라서 실제 workload에서 자주 수행하는 operation과 반드시 지켜야 하는 invariant를 먼저 적고, 그 조합에 가장 잘 맞는 구조를 선택한다.

자료구조 선택의 핵심 질문은 **우리 문제에서 가장 중요한 operation은 무엇이며, 그 operation을 빠르게 만들기 위해 어떤 다른 비용을 지불하는가**다.
