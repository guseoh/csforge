---
kind: concept
contentKey: dsa.core.stack-queue-deque.queue
topicContentKey: dsa.core.stack-queue-deque
slug: queue
title: "큐(Queue)"
summary: "enqueue·dequeue의 FIFO 불변식과 front·rear 상태가 발견·처리 순서를 유지하는 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "스택·큐의 LIFO/FIFO 계약과 배열, 크기 조정 배열, linked-list 구현을 비교한다."
    displayOrder: 1
---
# 큐(Queue)

큐는 rear에 원소를 추가하고 front에서 원소를 제거하는 FIFO(First In, First Out) 자료구조다. 먼저 들어온 원소가 먼저 나온다.

```text
enqueue A → enqueue B → enqueue C
front [A][B][C] rear

dequeue → A
```

핵심 불변식은 현재 큐에서 **가장 먼저 enqueue된 아직 남아 있는 원소가 다음 dequeue 대상**이라는 것이다. 이 순서 때문에 BFS처럼 먼저 발견한 정점을 먼저 확장해야 하는 알고리즘에 자연스럽게 사용된다.

배열로 구현할 때 dequeue마다 모든 원소를 왼쪽으로 이동하면 한 번의 제거가 `O(n)`이 된다. 대신 front와 rear 인덱스를 이동시키거나 circular 큐를 사용하면 이미 비운 공간을 재사용하면서 양끝 연산을 상수 시간에 처리할 수 있다. Linked 큐에서는 head와 tail을 함께 유지해 enqueue와 dequeue를 구현할 수 있다.

큐의 FIFO는 **꺼내는 순서**에 관한 보장이다. 큐에서 꺼낸 작업들이 이후 병렬로 실행된다면 완료 순서까지 FIFO라는 뜻은 아니다. 자료구조가 보장하는 order와 그 뒤 처리 단계의 semantics는 구분해야 한다.
