---
kind: concept
contentKey: dsa.core.stack-queue-deque.circular-queue
topicContentKey: dsa.core.stack-queue-deque
slug: circular-queue
title: "Circular Queue"
summary: "고정 배열을 ring으로 재사용하며 front·rear·size가 logical order와 empty/full 상태를 표현하는 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "array queue에서 제거된 앞 공간을 재사용하는 index 관리 원리를 확인한다."
    displayOrder: 1
---
# Circular Queue

### array 끝에 도달해도 앞의 빈 공간을 다시 사용한다

고정 배열 queue에서 rear가 끝까지 갔다고 해서 실제 queue가 full인 것은 아니다. 앞쪽 원소가 dequeue되었다면 그 공간은 비어 있다. circular queue는 index를 capacity로 modulo 연산해 끝 다음을 다시 0으로 연결한다.

```text
capacity = 5
index: 0 1 2 3 4

rear = (rear + 1) % 5
```

물리 배열은 직선이지만 logical queue는 ring처럼 동작한다.

### physical order와 logical FIFO order가 다를 수 있다

예를 들어 array 상태가 다음과 같다고 하자.

```text
index : 0 1 2 3 4
value : D E _ B C
front = 3, size = 4
```

logical queue order는 `B → C → D → E`다. memory에 보이는 index 순서를 그대로 읽으면 FIFO 순서가 아니다. iteration이나 resize에서는 front부터 modulo로 따라가야 한다.

### front == rear만으로 empty와 full을 동시에 표현할 수 없다

rear가 한 바퀴 돌아 front와 같아질 수 있으므로 추가 규칙이 필요하다. 대표적으로:

- `size`를 별도로 유지한다.
- 항상 한 slot을 비워 두어 `nextRear == front`를 full로 사용한다.

두 방식은 usable capacity가 다르다. 구현 중 규칙을 섞으면 empty queue를 full로 보거나 아직 읽지 않은 값을 overwrite할 수 있다.

### enqueue와 dequeue invariant

size를 쓰는 모델이라면:

```text
0 <= size <= capacity
front = 다음 dequeue 위치
rear  = 다음 enqueue 위치
```

으로 정의할 수 있다. enqueue 성공 후 rear는 `(rear+1)%capacity`, size는 +1이고 dequeue 후 front는 `(front+1)%capacity`, size는 -1이다.

이 네 state 중 하나만 잘못 갱신돼도 wraparound 시점에 bug가 드러난다.

### overwrite ring과 bounded FIFO queue는 policy가 다르다

logging ring buffer처럼 full일 때 가장 오래된 데이터를 덮어쓰는 구조도 circular indexing을 사용할 수 있다. 하지만 일반 work queue는 unread task를 임의로 overwrite하면 안 될 수 있다.

따라서 ring이라는 storage shape와 full 상태에서 `reject/block/drop-oldest` 중 무엇을 할지는 별도 application policy다.

### concurrency는 또 다른 층위다

single-thread circular queue의 modulo invariant를 이해하는 것과 producer/consumer가 동시에 front/rear를 바꾸는 concurrent ring buffer는 다른 문제다. 후자에서는 atomicity와 memory ordering까지 별도로 보장해야 한다.
