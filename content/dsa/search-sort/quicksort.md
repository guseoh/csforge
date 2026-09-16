---
kind: concept
contentKey: dsa.core.search-sort.quicksort
topicContentKey: dsa.core.search-sort
slug: quicksort
title: "Quicksort"
summary: "pivot 분할과 최악 편향, 평균 성능을 비교한다."
level: 2
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/23quicksort/"
    title: "Algorithms, 4th Edition: Quicksort"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "partition invariant, pivot choice와 quicksort의 평균·최악 비용을 확인한다."
    displayOrder: 1
---
# Quicksort

Quicksort는 pivot을 하나 선택하고 partition을 수행해 입력을 pivot 기준의 두 구간으로 나눈 뒤, 각 구간을 다시 정렬한다.

```text
[7,2,5,1,6], pivot=5
→ [2,1] 5 [7,6]
```

Partition이 끝났다고 양쪽 내부가 정렬된 것은 아니다. 다만 왼쪽은 pivot보다 작은 쪽, 오른쪽은 큰 쪽이라는 조건이 만들어져 두 구간을 독립된 subproblem으로 볼 수 있다.

분할이 매번 절반에 가깝다면 recursion depth가 O(log n)이고 각 level의 partition work가 O(n)이므로 전체 O(n log n)을 기대할 수 있다.

반대로 pivot이 계속 최솟값이나 최댓값이 되어 `0`과 `n-1`로 나뉘면 recurrence가 다음처럼 된다.

```text
n → n-1 → n-2 → ... → 1
```

이 경우 시간은 O(n²), recursion depth도 O(n)까지 커진다. 따라서 quicksort의 성능은 partition 품질에 크게 의존한다.

Randomized pivot이나 다른 선택 전략은 반복적인 편향 분할 가능성을 낮출 수 있지만 worst-case 자체가 사라진다고 볼 수는 없다. Duplicate가 많은 입력에서는 3-way partition처럼 equal key를 따로 묶는 방식도 고려할 수 있다.

기본 array quicksort는 보조 merge buffer 없이 구현하기 쉽지만 swap 때문에 stable하지 않은 경우가 많다. 평균 성능, worst-case 위험, stability와 추가 공간을 함께 비교해야 한다.
