---
kind: concept
contentKey: java.core.coding-tests.arraydeque-stack-queue
topicContentKey: java.core.coding-tests
slug: arraydeque-stack-queue
title: "ArrayDeque stack and queue"
summary: "알고리즘 구현에서 ArrayDeque를 stack, queue, deque로 사용하는 operation과 주의점을 익힌다"
level: 1
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html"
    title: "Java SE 25 API: ArrayDeque"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: deque의 FIFO·LIFO operation과 null 제한 확인
---
# ArrayDeque로 stack·queue 사용하기

## 쉬운 진입

한 자료구조로 앞과 뒤에서 넣고 뺄 수 있으면 문제의 요구에 따라 queue와 stack을 빠르게
표현할 수 있다. ArrayDeque에서 queue는 보통 addLast/pollFirst, stack은 push/pop 또는
addFirst/removeFirst를 한 쌍으로 사용한다.

## 정확한 메커니즘

~~~
Deque<Integer> queue = new ArrayDeque<>();
queue.addLast(10);
queue.addLast(20);
int first = queue.pollFirst(); // 10

Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
int top = stack.pop();          // 2
~~~

peek은 원소를 보지만 제거하지 않고, poll 계열은 비어 있으면 null을 반환한다. remove
계열은 비어 있을 때 예외를 던진다. ArrayDeque는 null 원소를 허용하지 않으므로 “없음”을
null로 표현하는 API와 값 자체가 nullable한 모델을 섞지 않는다. queue의 앞·뒤 방향을
한 번 정하면 모든 연산에서 일관되게 유지해야 한다.

## 실전·면접 연결

Stack보다 Deque의 LIFO API를 사용하면 의도가 명확하고, 양 끝을 쓰는 문제에서는 별도
양방향 자료구조를 만들 필요가 없다. 이 Concept은 deque API 사용법에 집중하며, deque를
이용한 BFS/DFS 등의 알고리즘 이론은 Data Structures & Algorithms 영역에서 다룬다.

## 흔한 오해

- ArrayDeque의 iterator 순회가 우선순위 정렬을 제공하는 것은 아니다.
- peek과 poll은 둘 다 원소를 제거하지 않는다라는 말은 틀리다. poll은 제거한다.
- ArrayDeque에 null을 넣어 빈 상태의 표시로 사용할 수 없다.
