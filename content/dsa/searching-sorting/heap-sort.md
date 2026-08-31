---
kind: concept
contentKey: dsa.core.search-sort.heap-sort
topicContentKey: dsa.core.search-sort
slug: heap-sort
title: "Heap Sort"
summary: "heap invariant로 in-place 정렬을 수행하는 과정을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 90
references:
  - url: "https://algs4.cs.princeton.edu/25applications/"
    title: "Algorithms, 4th Edition: Sorting Applications"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "comparison sort의 decision-tree 하한을 확인한다."
    displayOrder: 1
---
# Heap Sort

max-heap을 만든 뒤 root를 배열 끝과 swap하고 줄어든 prefix에 sink를 반복하면 끝에서부터 큰 값이 확정된다. 정렬된 suffix와 prefix heap invariant를 동시에 유지하므로 O(n log n), 추가 배열 O(1)을 얻을 수 있다.

heapify에서 마지막 internal node부터 내려가야 모든 child 상태가 준비된다. cache locality와 constant factor는 quicksort보다 불리할 수 있고, 기본 구현은 stable하지 않다.

### Backend 연결

memory 상한이 엄격하고 worst O(n log n)이 필요할 때 후보가 된다. 결과의 동일 key 순서가 API 계약이면 별도 안정성 처리를 둔다.
