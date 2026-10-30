---
kind: concept
contentKey: dsa.core.search-sort.heap-sort
topicContentKey: dsa.core.search-sort
slug: heap-sort
title: "힙 정렬(Heap Sort)"
summary: "heap 불변식을 이용해 in-place 정렬을 수행하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/24pq/"
    title: "Algorithms, 4th Edition: Priority Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "우선순위 큐 ADT와 binary heap 구현의 비용을 확인한다."
    displayOrder: 1
---
# 힙 정렬(Heap Sort)

Ascending heap sort는 먼저 전체 배열을 max-heap으로 만든다. 그러면 루트에는 현재 범위의 최댓값이 있으므로, 루트를 배열의 마지막 원소와 교환하면 그 위치는 최종 정렬 위치가 된다.

이후 heap 범위를 한 칸 줄이고 루트에서 sift-down을 수행해 남은 prefix의 max-heap 불변식을 복구한다.

```text
[ max-heap prefix | sorted suffix ]
```

반복 중에는 왼쪽 prefix가 max-heap이고, 오른쪽 suffix는 이미 최종 위치가 확정된 ascending 영역이라는 두 불변식을 함께 유지한다. 매 iteration마다 suffix가 한 칸씩 커진다.

상향식 heapify로 초기 heap을 O(n)에 만들 수 있고, 이후 O(n)번의 extraction에서 각각 최대 O(log n)의 sift-down을 수행하므로 전체 시간은 O(n log n)이다. 최악의 경우도 같은 차수로 제한된다.

Heap을 input 배열 안에서 직접 표현하면 큰 auxiliary buffer 없이 정렬할 수 있다. 반면 swap 과정에서 equal key의 기존 상대 순서가 바뀔 수 있어 기본 heap sort는 stable하지 않다.

따라서 heap sort는 **O(n log n) 최악의 경우와 낮은 추가 공간**이 강점이지만, stability와 실제 constant/지역성 비용까지 함께 비교해야 한다.
