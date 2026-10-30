---
kind: concept
contentKey: dsa.core.stack-queue-deque.circular-queue
topicContentKey: dsa.core.stack-queue-deque
slug: circular-queue
title: "원형 큐(Circular Queue)"
summary: "front·rear를 modulo로 순환시켜 고정 배열의 빈 슬롯을 재사용하고 empty·full 상태를 구분하는 방식을 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "스택·큐의 LIFO/FIFO 계약과 배열, 크기 조정 배열, linked-list 구현을 비교한다."
    displayOrder: 1
---
# 원형 큐(Circular Queue)

고정 배열로 큐를 구현할 때 dequeue된 앞쪽 슬롯을 다시 사용하지 않으면 rear가 배열 끝에 도달한 뒤 빈 공간이 있어도 더 넣지 못하는 문제가 생긴다. Circular 큐는 인덱스를 용량으로 나눈 나머지로 이동해 배열의 끝 다음을 다시 처음으로 연결한다.

```text
next = (index + 1) % capacity
```

물리 배열의 인덱스 순서와 logical FIFO 순서는 달라질 수 있다. Front가 3이라면 배열 앞쪽 슬롯에 더 나중 원소가 저장되어 있어도 logical 순회는 front부터 modulo 순서로 진행해야 한다.

```text
index : 0 1 2 3 4
value : D E _ B C
front = 3
logical order = B → C → D → E
```

`front == rear`만으로 empty와 full을 모두 표현하려 하면 상태가 모호해진다. 그래서 `size`를 별도로 유지하거나, 항상 한 슬롯을 비워 두고 `nextRear == front`를 full로 정의하는 식의 불변식이 필요하다.

용량은 양수여야 modulo 연산이 정의된다. Size를 유지한다면 `0 <= size <= capacity`, front는 다음 dequeue 위치, rear는 다음 enqueue 위치라는 상태를 함께 갱신해야 한다. **Circular 큐의 핵심은 modulo 인덱스 자체가 아니라 wraparound 이후에도 logical FIFO order와 empty/full 불변식을 유지하는 것**이다.
