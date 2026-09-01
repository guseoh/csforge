---
kind: concept
contentKey: dsa.core.search-sort.heap-sort
topicContentKey: dsa.core.search-sort
slug: heap-sort
title: "Heap Sort"
summary: "max-heap prefix와 sorted suffix invariant를 유지하며 in-place O(n log n) 정렬을 만드는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/24pq/"
    title: "Algorithms, 4th Edition: Priority Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "priority queue ADT와 binary heap 구현의 비용을 확인한다."
    displayOrder: 1
---
# Heap Sort

### max-heap의 root를 뒤에서부터 확정한다

ascending heap sort는 먼저 전체 array를 max-heap으로 만든다. 그러면 root에는 현재 가장 큰 값이 있다. root를 array의 마지막 원소와 swap하면 마지막 위치의 값은 최종 sorted position이 확정된다.

그다음 heap 범위를 한 칸 줄이고 새 root를 sink해 남은 prefix의 max-heap invariant를 복구한다.

```text
[ max-heap prefix | sorted suffix ]
```

반복이 진행될수록 heap prefix는 줄고 sorted suffix는 오른쪽에서 왼쪽으로 커진다.

### 두 invariant를 동시에 유지한다

각 iteration 시작 시 다음이 참이어야 한다.

1. `[0, heapSize)`는 max-heap이다.
2. `[heapSize, n)`은 이미 최종 위치가 확정된 ascending suffix다.
3. suffix의 모든 원소는 heap prefix의 원소보다 크거나 같다.

root를 suffix 바로 앞과 swap하고 heapSize를 감소시킨 뒤 sink하면 다음 iteration에서도 같은 invariant가 유지된다.

### build-heap은 O(n), extraction phase는 O(n log n)이다

heap을 n번 insert해 만들 필요 없이 bottom-up heapify를 사용하면 O(n)에 만들 수 있다. 이후 n번에 가까운 root extraction에서 각 sink가 최대 O(log n)이므로 전체 sorting time은 O(n log n)이다.

worst-case도 O(n log n)으로 제한되는 것이 quicksort의 O(n²) worst-case와 비교되는 특징이다.

### extra array 없이 정렬할 수 있지만 stable하지 않다

heap 자체를 input array 안에 만들고 root와 끝을 swap하므로 auxiliary array는 O(1) 수준으로 유지할 수 있다. 하지만 먼 위치의 swap이 equal-key 원소의 기존 상대 순서를 바꿀 수 있어 기본 heap sort는 stable하지 않다.

또한 memory access pattern과 constant factor 때문에 실전 평균 성능에서는 well-implemented quicksort 계열보다 불리할 수 있다. 따라서 `worst O(n log n) + 낮은 extra memory`가 정말 중요한 조건인지 보고 선택한다.
