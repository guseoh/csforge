---
kind: concept
contentKey: dsa.core.trees.heap
topicContentKey: dsa.core.trees
slug: heap
title: "Heap"
summary: "완전 이진 트리와 parent-child priority invariant를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://algs4.cs.princeton.edu/24pq/"
    title: "Algorithms, 4th Edition: Priority Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "priority queue ADT와 binary heap 구현의 비용을 확인한다."
    displayOrder: 1
---
# Heap

Binary heap은 **complete binary tree shape**와 **parent-child priority invariant**를 함께 사용하는 자료구조다. Min-heap에서는 모든 parent가 자신의 child보다 작거나 같고, max-heap에서는 반대다. 이 조건 때문에 root에는 전체 원소 중 최소값 또는 최대값이 위치한다.

```text
min-heap
        2
      /   \
     5     4
    / \   /
   9   7 8
```

Heap은 전체를 정렬하지 않는다. 위 예에서 5와 4의 상대 순서는 문제가 되지 않는다. 서로 parent-child 관계가 아니기 때문이다. 따라서 root의 최우선 값을 빠르게 얻을 수 있지만 arbitrary key를 binary search처럼 찾을 수는 없다.

Complete binary tree는 마지막 level을 제외하고 모두 채우고, 마지막 level도 왼쪽부터 채운다. 이 shape 덕분에 pointer 없이 array에 compact하게 저장할 수 있다. 0-based index에서는 보통 `left=2i+1`, `right=2i+2`, `parent=floor((i-1)/2)` 관계를 사용한다.

Insert는 새 원소를 array 끝에 추가해 shape를 먼저 지킨 뒤, parent와 비교하며 위로 이동시켜 heap invariant를 복구한다. Root를 제거할 때는 마지막 원소를 root로 옮긴 뒤 적절한 child와 교환하며 아래로 내려간다. Tree height가 O(log n)이므로 두 operation은 O(log n)이다.

이미 n개 원소가 array에 준비되어 있다면 아래 node부터 bottom-up으로 heapify해 전체 O(n)에 heap을 만들 수 있다. 빈 heap에 n번 insert하는 O(n log n) 방식과 구분해야 한다.
