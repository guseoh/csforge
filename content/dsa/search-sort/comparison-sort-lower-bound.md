---
kind: concept
contentKey: dsa.core.search-sort.comparison-sort-lower-bound
topicContentKey: dsa.core.search-sort
slug: comparison-sort-lower-bound
title: "Comparison Sort Lower Bound"
summary: "comparison decision tree가 Ω(n log n)을 제한하는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stability가 동일 key 원소의 상대 순서를 보존하는 의미와 sorting application을 확인한다."
    displayOrder: 1
---
# Comparison Sort Lower Bound

Comparison sort는 원소의 값을 직접 해석하지 않고 두 원소의 비교 결과만으로 순서를 결정한다. 서로 다른 n개 원소에는 `n!`개의 가능한 입력 순서가 있으므로, 정렬 알고리즘은 비교를 통해 그중 하나를 구분해야 한다.

비교 결과를 binary decision tree로 생각하면 leaf는 가능한 순서를 나타낸다. 높이 h인 binary tree는 최대 `2^h`개의 leaf를 가질 수 있으므로 모든 순서를 구분하려면 다음이 필요하다.

```text
2^h >= n!
h >= log2(n!)
```

`log(n!)`은 Θ(n log n)이므로 comparison만 사용하는 일반 정렬의 worst-case comparison 수에는 Ω(n log n) lower bound가 생긴다.

Merge sort처럼 O(n log n) comparison으로 정렬하는 알고리즘은 이 model에서 asymptotically lower bound와 같은 차수에 도달한다.

이 하한은 **모든 정렬 알고리즘**에 적용되는 것이 아니다. Counting sort나 radix sort는 key의 범위나 digit representation 같은 추가 정보를 사용하므로 comparison-only model 밖에 있다. 대신 key range, 추가 메모리, 여러 pass 같은 다른 제약을 지불한다.

따라서 `정렬은 무조건 Ω(n log n)`이 아니라, **일반 comparison-based sorting에서는 Ω(n log n)이 필요하다**고 구분해야 한다.
