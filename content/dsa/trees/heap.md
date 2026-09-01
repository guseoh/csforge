---
kind: concept
contentKey: dsa.core.trees.heap
topicContentKey: dsa.core.trees
slug: heap
title: "Heap"
summary: "complete binary tree shape와 parent-child priority invariant가 array 기반 priority operation을 만드는 원리를 설명한다."
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

### heap은 전체 정렬이 아니라 parent-child 우선순위만 보장한다

min-heap은 모든 node에서 parent key가 child key보다 작거나 같다는 invariant를 가진다. max-heap은 반대다. 이 규칙 때문에 root에는 전체 원소 중 최소값 또는 최대값이 위치하지만, sibling이나 서로 다른 subtree 사이의 상대 순서까지 정렬되지는 않는다.

```text
min-heap
        2
      /   \
     5     4
    / \   /
   9   7 8
```

`5 < 4`가 아니어도 문제없다. 둘은 서로 parent-child 관계가 아니기 때문이다. 그래서 heap에서 arbitrary key를 binary search처럼 찾을 수는 없다.

### complete binary tree라서 array에 compact하게 저장할 수 있다

heap은 마지막 level을 제외하고 가득 차며 마지막 level도 왼쪽부터 채우는 complete binary tree shape를 사용한다. 이 구조 덕분에 pointer 없이 array index로 parent/child 위치를 계산할 수 있다.

0-based index라면 보통:

```text
left(i)  = 2i + 1
right(i) = 2i + 2
parent(i)= floor((i - 1) / 2)
```

따라서 tree node allocation 없이 연속 memory에 저장할 수 있어 locality에도 유리할 수 있다.

### insert는 위로, root 제거는 아래로 invariant를 복구한다

새 원소는 complete-tree shape를 지키기 위해 array 끝에 들어간다. min-heap에서 새 값이 parent보다 작으면 swap하며 위로 올라가는 swim/sift-up을 수행한다. tree height가 O(log n)이므로 최대 O(log n) swap이 필요하다.

root를 제거하면 마지막 원소를 root로 옮겨 빈 자리를 없앤 뒤, 더 작은 child와 swap하며 아래로 내려가는 sink/sift-down으로 invariant를 회복한다.

```text
insert → append → sift up
extract-root → last to root → sift down
```

### build-heap은 반복 insert와 다른 비용을 가질 수 있다

n개 원소를 빈 heap에 하나씩 insert하면 O(n log n) 상한으로 볼 수 있다. 하지만 이미 array에 들어 있는 원소를 bottom-up으로 heapify하면 아래쪽 많은 node의 이동 거리가 짧기 때문에 전체 O(n)에 heap을 만들 수 있다.

이 차이는 알고리즘 선택에서 중요하다. 데이터가 이미 한 번에 준비돼 있다면 `n번 insert`가 유일한 방법은 아니다.

### heap은 priority queue의 한 구현이다

heap 자체는 자료구조이고 priority queue는 `insert`, `peek-min/max`, `extract-min/max` 같은 추상 operation을 제공하는 ADT다. heap이 자주 쓰이는 구현이지만 둘을 같은 단어로 취급하면 priority update, tie-breaker, arbitrary removal 같은 API 요구를 놓치기 쉽다.
