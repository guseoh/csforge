---
kind: concept
contentKey: dsa.core.search-sort.partition
topicContentKey: dsa.core.search-sort
slug: partition
title: "Partition"
summary: "pivot보다 작은·큰 구간 invariant를 포인터 이동으로 유지한다."
level: 2
status: PUBLISHED
displayOrder: 80
references:
  - url: "https://algs4.cs.princeton.edu/23quicksort/"
    title: "Algorithms, 4th Edition: Quicksort"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "partition invariant, pivot choice와 quicksort의 평균·최악 비용을 확인한다."
    displayOrder: 1
---
# Partition

Partition은 현재 range를 완전히 정렬하는 연산이 아니라, pivot을 기준으로 원소를 서로 다른 구간에 배치하는 연산이다. 핵심은 loop가 진행되는 동안 각 pointer가 어떤 구간을 의미하는지 invariant로 유지하는 것이다.

예를 들어 한 구현에서는 다음과 같이 생각할 수 있다.

```text
[ < pivot | >= pivot | unclassified | pivot ]
```

새 원소를 하나 검사할 때 pivot보다 작다면 `< pivot` 구간 끝으로 이동시키고, 그렇지 않다면 현재 구간에 남긴다. 매 반복에서 unclassified 영역은 반드시 줄어든다.

Partition이 끝나면 pivot을 경계 위치로 옮겨 왼쪽과 오른쪽의 조건을 확정할 수 있다. 이때 왼쪽 내부와 오른쪽 내부가 각각 정렬되었다는 보장은 없다. Quicksort가 두 구간을 다시 재귀적으로 처리하는 이유다.

비교 조건에서 `< pivot`과 `<= pivot` 중 무엇을 사용하는지는 duplicate 처리에 영향을 준다. 같은 값이 많을 때 한쪽으로 계속 몰리면 분할 품질이 나빠질 수 있고, 3-way partition은 `<`, `==`, `>` 세 구간으로 이를 명시적으로 나눈다.

Partition correctness는 swap 횟수보다 **각 pointer가 표현하는 구간 invariant가 반복 전후에 유지되는가**로 확인하는 것이 좋다.
