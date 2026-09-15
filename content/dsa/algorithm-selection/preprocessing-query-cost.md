---
kind: concept
contentKey: dsa.core.algorithm-selection.preprocessing-query-cost
topicContentKey: dsa.core.algorithm-selection
slug: preprocessing-query-cost
title: "Preprocessing and Query Cost"
summary: "초기 전처리 비용과 반복 query 비용의 합을 비교한다."
level: 2
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
# Preprocessing and Query Cost

Preprocessing은 초기 비용을 먼저 지불해 이후 반복 query의 비용을 줄이는 전략이다. 정렬 후 binary search를 사용하거나 prefix sum을 만들어 range query를 빠르게 처리하는 것이 대표적이다.

전체 비용은 한 번의 query가 아니라 다음처럼 생각해야 한다.

```text
총 비용
= preprocessing cost
+ query count × per-query cost
+ 필요한 update/maintenance cost
```

예를 들어 매번 선형 탐색하면 Q개의 query에 O(Qn)이 들 수 있다. 한 번 O(n log n)에 정렬한 뒤 각 query를 O(log n)에 처리하면 O(n log n + Q log n)이 된다. Query가 적다면 전처리가 손해일 수 있지만 반복 횟수가 많아지면 초기 비용을 회수할 수 있다.

원본 데이터가 자주 바뀌면 전처리된 구조의 유지 비용도 포함해야 한다. Immutable data의 반복 range sum에는 prefix sum이 잘 맞지만 update가 빈번하다면 다른 구조가 더 적합할 수 있다.

따라서 전처리 여부는 **초기 비용, query 횟수, query당 절감량과 update 빈도**를 함께 비교해 결정한다.
