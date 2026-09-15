---
kind: concept
contentKey: dsa.core.search-sort.stable-sort
topicContentKey: dsa.core.search-sort
slug: stable-sort
title: "Stable Sort"
summary: "동일 key의 상대 순서를 보존하는 안정성의 의미와 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stability가 동일 key 원소의 상대 순서를 보존하는 의미와 sorting application을 확인한다."
    displayOrder: 1
---
# Stable Sort

Stable sort는 비교 key가 같은 두 원소의 **입력에서의 상대 순서**를 결과에서도 유지하는 정렬이다.

```text
input:  A(10), B(20), C(10)
stable sort by score
      → A(10), C(10), B(20)
```

A와 C의 score는 같지만 A가 먼저 있었으므로 결과에서도 A가 앞선다. Unstable sort에서는 C와 A의 순서가 바뀌어도 score 기준 정렬 자체는 맞을 수 있다.

Stability는 여러 기준을 단계적으로 정렬할 때 의미가 있다. 먼저 secondary key로 정렬한 뒤 primary key로 stable sort하면, primary key가 같은 원소 사이에서 이전 순서가 보존된다. 다만 최종 ordering contract를 comparator 하나로 직접 정의하는 방법도 있으므로 stable sort가 유일한 해결책은 아니다.

Stable하다는 것은 결과가 언제나 deterministic하다는 뜻도 아니다. 입력 순서 자체가 매번 다르면 equal-key 원소의 결과 순서도 달라질 수 있다.

알고리즘에 따라 stability를 자연스럽게 제공하기도 하고, 추가 buffer나 metadata가 필요하기도 한다. 따라서 equal-key 순서를 보존해야 하는지와 그에 따른 time/space 비용을 함께 고려해야 한다.
