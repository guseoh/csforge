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
    recommendation: "heap invariant와 배열 index 관계를 확인한다."
    displayOrder: 1
---
# Heap

min-heap은 parent key가 child보다 작거나 같고 max-heap은 반대인 complete binary tree다. 배열에서 parent와 child index를 계산할 수 있어 pointer 없이 저장하며, 삽입은 위로 swim, root 제거는 마지막 원소를 내리는 sink로 invariant를 복구한다.

heap은 전체 정렬을 유지하지 않고 root의 우선순위만 보장한다. build-heap은 bottom-up으로 O(n)에 가능하지만 매 삽입마다 정렬된 배열처럼 탐색할 수 없고 arbitrary delete에는 index 관리가 필요하다.

### Backend 연결

최소 deadline 작업이나 top-k를 처리할 때 heap과 balanced tree를 비교한다. queue의 FIFO와 priority queue의 ordering을 혼동하지 않는다.

