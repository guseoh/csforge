---
kind: concept
contentKey: dsa.core.stack-queue-deque.circular-queue
topicContentKey: dsa.core.stack-queue-deque
slug: circular-queue
title: "Circular Queue"
summary: "front·rear를 modulo로 순환시켜 고정 배열의 빈 slot을 재사용하고 empty·full 상태를 구분하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Circular Queue

고정 배열로 queue를 구현할 때 dequeue된 앞쪽 slot을 다시 사용하지 않으면 rear가 배열 끝에 도달한 뒤 빈 공간이 있어도 더 넣지 못하는 문제가 생긴다. Circular queue는 index를 capacity로 나눈 나머지로 이동해 배열의 끝 다음을 다시 처음으로 연결한다.

```text
next = (index + 1) % capacity
```

물리 배열의 index 순서와 logical FIFO 순서는 달라질 수 있다. Front가 3이라면 배열 앞쪽 slot에 더 나중 원소가 저장되어 있어도 logical 순회는 front부터 modulo 순서로 진행해야 한다.

```text
index : 0 1 2 3 4
value : D E _ B C
front = 3
logical order = B → C → D → E
```

`front == rear`만으로 empty와 full을 모두 표현하려 하면 상태가 모호해진다. 그래서 `size`를 별도로 유지하거나, 항상 한 slot을 비워 두고 `nextRear == front`를 full로 정의하는 식의 invariant가 필요하다.

Size를 유지한다면 `0 <= size <= capacity`, front는 다음 dequeue 위치, rear는 다음 enqueue 위치라는 상태를 함께 갱신해야 한다. **Circular queue의 핵심은 modulo index 자체가 아니라 wraparound 이후에도 logical FIFO order와 empty/full invariant를 유지하는 것**이다.
