---
kind: concept
contentKey: dsa.core.trees.priority-queue
topicContentKey: dsa.core.trees
slug: priority-queue
title: "Priority Queue"
summary: "최우선 원소 추출 추상화와 heap 구현 비용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 70
references:
  - url: "https://algs4.cs.princeton.edu/24pq/"
    title: "Algorithms, 4th Edition: Priority Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "priority queue ADT와 binary heap 구현의 비용을 확인한다."
    displayOrder: 1
---
# Priority Queue

Priority queue는 삽입 순서가 아니라 **priority가 가장 높은 또는 낮은 원소를 다음 대상으로 선택하는 ADT**다. FIFO queue와는 ordering contract 자체가 다르다.

```text
insert(A, 5)
insert(B, 1)
insert(C, 3)

min-priority queue → B가 먼저 선택됨
```

일반적인 operation은 `insert`, `peek-min/max`, `extract-min/max`다. Binary heap은 이를 구현하는 대표적인 자료구조로, root에 최우선 원소를 두기 때문에 peek를 O(1), insert와 extract를 O(log n)에 제공할 수 있다.

Priority queue와 heap은 같은 개념이 아니다. Priority queue는 어떤 operation과 ordering을 제공할지를 정의하고, heap은 그 contract를 구현하는 한 방법이다. Operation mix에 따라 ordered tree나 다른 표현을 사용할 수도 있다.

같은 priority를 가진 여러 원소의 순서는 priority 값만으로 정해지지 않는다. 삽입 순서를 유지해야 한다면 `(priority, sequence)`처럼 별도의 tie-breaker를 contract에 포함해야 한다. Heap 내부의 우연한 배치를 stable ordering으로 가정해서는 안 된다.

이미 들어간 원소의 priority를 바꾸면 현재 heap 위치가 더 이상 invariant를 만족하지 않을 수 있다. Priority update를 지원하려면 적절한 위치로 다시 이동시키거나 새 entry로 재삽입하는 등 구현이 그 변경을 명시적으로 처리해야 한다.
