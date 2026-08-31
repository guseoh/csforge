---
kind: concept
contentKey: dsa.core.sequential.array-vs-linked
topicContentKey: dsa.core.sequential
slug: array-vs-linked
title: "Array versus Linked"
summary: "접근·삽입·locality와 memory 비용으로 두 구조를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Array versus Linked

array는 index 접근과 cache locality가 좋지만 중간 삽입·삭제에 shift가 필요하다. linked structure는 위치를 알고 있을 때 link만 바꾸지만 위치 검색과 pointer chasing이 느리고 node마다 metadata·allocator 비용이 붙는다.

따라서 “삽입이 O(1)”이라는 말은 node와 predecessor를 이미 알고 있다는 조건을 포함한다. workload의 access/insert 비율, 원소 크기, memory locality, 안정적인 reference 필요 여부를 함께 놓고 선택한다.

### Backend 연결

in-memory queue, LRU, result buffer를 고를 때 Big-O와 CPU cache를 같이 측정한다. Java collection 이름보다 실제 operation sequence와 capacity·allocation 정책을 먼저 적는다.

