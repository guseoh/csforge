---
kind: concept
contentKey: java.core.collections.queue-deque-arraydeque
topicContentKey: java.core.collections
slug: queue-deque-arraydeque
title: "Queue, Deque와 ArrayDeque"
summary: "FIFO queue와 양끝 삽입·삭제가 가능한 deque를 구분하고 stack 용도까지 ArrayDeque로 표현하는 방법을 이해한다"
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html"
    title: "Java SE 25 API: Deque"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: Deque의 양끝 연산과 stack 사용 계약 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html"
    title: "Java SE 25 API: ArrayDeque"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: ArrayDeque 구현 특성 확인
---
# Queue, Deque와 ArrayDeque

데이터를 넣은 순서대로 처리해야 할 때는 **Queue**가 자연스럽습니다. 가장 먼저 들어온 값이 가장 먼저 나오는 FIFO(First-In, First-Out) 구조입니다.

```java
Queue<String> queue = new ArrayDeque<>();
queue.offer("A");
queue.offer("B");

queue.poll(); // A
```

### 예외를 던지는 API와 특별값을 반환하는 API가 있다

Queue/Deque에는 비슷한 동작을 하는 두 종류 메서드가 있습니다.

| 동작 | 실패 시 예외 | 실패 시 특별값 |
|---|---|---|
| 추가 | `add` | `offer` |
| 제거 | `remove` | `poll` |
| 조회 | `element` | `peek` |

빈 queue에서 값을 꺼낼 가능성이 자연스럽다면 `poll()`처럼 `null`을 반환하는 API가 사용하기 편한 경우가 많습니다. 단, 원소 자체의 null 허용 여부는 구현 계약을 확인해야 합니다. `ArrayDeque`는 null 원소를 허용하지 않습니다.

### Deque는 양끝을 모두 사용한다

`Deque`는 double-ended queue로 앞과 뒤 양쪽에서 추가·삭제할 수 있습니다.

```java
Deque<Integer> deque = new ArrayDeque<>();
deque.addFirst(1);
deque.addLast(2);
```

그래서 queue뿐 아니라 stack 동작도 표현할 수 있습니다.

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(10);
stack.push(20);
stack.pop(); // 20
```

새 코드에서는 오래된 `Stack` 클래스보다 `Deque` 구현을 stack으로 사용하는 방식이 일반적으로 권장됩니다.

### ArrayDeque가 좋은 기본 선택인 이유

앞뒤 삽입·삭제가 필요한 일반적인 queue/deque 용도에서 `ArrayDeque`는 동적 배열 기반 구현을 제공합니다. `LinkedList`도 `Deque`를 구현하지만 node 기반 구조가 꼭 필요한 이유가 없다면 `ArrayDeque`가 더 단순한 기본 선택인 경우가 많습니다.

다만 thread-safe queue가 필요하다면 `ArrayDeque` 자체로 해결되지 않습니다. 여러 스레드 생산자/소비자 문제는 `BlockingQueue` 같은 concurrent API를 봐야 합니다.

### 문제에서는 이름보다 방향을 그린다

```text
Queue:   [A][B][C] → A부터 제거
Deque: ← [A][B][C] → 양쪽 모두 접근
Stack:   push/pop 같은 한쪽 끝 사용
```

어느 쪽에서 넣고 어느 쪽에서 빼는지만 표시하면 API 결과 문제를 훨씬 쉽게 풀 수 있습니다.
