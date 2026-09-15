---
kind: concept
contentKey: dsa.core.search-sort.merge-sort
topicContentKey: dsa.core.search-sort
slug: merge-sort
title: "Merge Sort"
summary: "분할·정렬·merge invariant와 안정성·추가 공간을 분석한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stability가 동일 key 원소의 상대 순서를 보존하는 의미와 sorting application을 확인한다."
    displayOrder: 1
---
# Merge Sort

Merge sort는 입력을 더 작은 부분으로 나눈 뒤, **이미 정렬된 두 sequence를 올바르게 합치는 merge**를 반복해 전체를 정렬한다.

```text
[7,2,5,1]
→ [7,2] [5,1]
→ [7] [2] [5] [1]
→ [2,7] [1,5]
→ [1,2,5,7]
```

Merge 단계에서는 두 sequence의 현재 첫 원소를 비교해 더 작은 값을 결과에 추가한다. 이때 결과 prefix는 최종 정렬 결과에서 이미 위치가 확정된 원소들이다. 한쪽 sequence가 끝나면 다른 쪽의 남은 원소는 이미 정렬되어 있으므로 그대로 이어 붙일 수 있다.

입력을 절반씩 나누면 recursion depth는 O(log n)이고, 각 level에서 모든 원소를 한 번씩 merge하므로 총 시간은 O(n log n)이다.

Array 기반 구현은 보통 merge 결과를 담기 위한 O(n) 보조 공간을 사용한다. 대신 equal key에서 왼쪽 원소를 먼저 선택하면 기존 상대 순서를 보존해 stable하게 구현할 수 있다.

Merge sort의 핵심은 분할 자체가 아니라 **두 sorted sequence를 선형 시간에 합치는 invariant**다. Time complexity, stability, auxiliary space를 함께 보고 선택해야 한다.
