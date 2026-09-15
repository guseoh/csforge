---
kind: concept
contentKey: dsa.core.stack-queue-deque.deque
topicContentKey: dsa.core.stack-queue-deque
slug: deque
title: "Deque"
summary: "front와 back 양끝에서 삽입·삭제하는 operation set과 stack·queue 활용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Deque

Deque(double-ended queue)는 front와 back 양쪽에서 원소를 삽입하고 삭제할 수 있는 자료구조다.

```text
pushFront ← [A][B][C] → pushBack
 popFront ←           → popBack
```

한쪽 끝에서만 push/pop하면 stack처럼 사용할 수 있고, back에 넣고 front에서 빼면 queue처럼 사용할 수 있다. 하지만 양끝 operation을 제공한다는 것이 arbitrary middle access나 priority ordering까지 제공한다는 뜻은 아니다.

구현은 circular array나 doubly linked structure를 사용할 수 있다. Circular array는 양끝 index를 ring 형태로 이동시키고, doubly linked structure는 head와 tail link를 갱신한다. 같은 deque ADT라도 storage representation에 따라 resize, locality와 memory overhead가 달라진다.

Deque가 특히 유용한 경우는 양쪽 끝에서 서로 다른 제거 조건을 적용해야 할 때다. Sliding-window 알고리즘에서는 오래되어 window 밖으로 나간 원소를 front에서 제거하고, 새로운 원소 때문에 더 이상 후보가 될 수 없는 값을 back에서 제거할 수 있다.

**Deque의 핵심은 양끝을 모두 O(1) 수준의 operation boundary로 사용할 수 있다는 점**이며, 어떤 끝에서 무엇을 넣고 빼는지는 문제의 invariant가 결정한다.
