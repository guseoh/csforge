---
kind: concept
contentKey: dsa.core.stack-queue-deque.deque
topicContentKey: dsa.core.stack-queue-deque
slug: deque
title: "Deque"
summary: "양쪽 끝의 push/pop을 하나의 자료구조에서 지원하고 stack·queue·sliding-window 패턴으로 사용하는 원리를 설명한다."
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

### front와 back 양쪽을 operation 경계로 사용한다

deque(double-ended queue)는 front와 back 양쪽에서 삽입·삭제할 수 있다.

```text
pushFront ← [ A B C ] → pushBack
 popFront ←           → popBack
```

한쪽 끝에서만 push/pop하면 stack처럼 사용할 수 있고, back에 넣고 front에서 빼면 FIFO queue가 된다. 즉 stack과 queue operation을 포함하지만 arbitrary middle access나 priority ordering까지 제공한다는 뜻은 아니다.

### 구현은 circular array와 doubly linked structure가 대표적이다

circular array deque는 front/back index를 ring으로 이동시켜 양끝 operation을 O(1) amortized에 처리하고 연속 memory locality를 얻기 쉽다. capacity가 차면 resize가 필요할 수 있다.

doubly linked deque는 head/tail node를 연결해 양끝 추가·삭제가 자연스럽고 capacity growth가 단순하지만 node allocation과 pointer overhead가 있다.

따라서 deque라는 ADT와 실제 storage representation을 구분한다.

### sliding window에서는 '현재 window에 아직 의미 있는 후보'만 보관할 수 있다

window가 오른쪽으로 이동할 때 오래된 index는 front에서 제거하고, 새 원소는 back으로 들어온다. monotonic queue와 결합하면 back에서 더 이상 최대/최소 후보가 될 수 없는 원소도 제거한다.

이처럼 deque의 강점은 **양쪽에서 서로 다른 lifetime rule을 적용할 수 있다는 것**이다.

### work stealing에서도 양끝 의미가 다를 수 있다

한 worker가 자신의 최근 task를 한쪽에서 처리하고 다른 worker가 반대쪽에서 오래된 task를 steal하는 구조에 deque가 쓰일 수 있다. 하지만 concurrent deque의 atomicity/memory ordering은 기본 자료구조 operation보다 훨씬 복잡하다.

자료구조를 배울 때는 먼저 single-thread invariant를 이해하고, lock-free/concurrent semantics를 같은 수준의 단순 push/pop 문제로 축소하지 않는다.

### deque는 priority queue가 아니다

양끝 operation이 있다고 해서 arbitrary priority가 높은 원소를 가운데에서 찾아 꺼낼 수 있는 것은 아니다. priority가 핵심이면 heap 등 별도 ordering structure가 필요하다. ADT 선택은 지원하는 operation set에서 시작한다.
