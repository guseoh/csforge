---
kind: concept
contentKey: java.core.collections.queue-deque-arraydeque
topicContentKey: java.core.collections
slug: queue-deque-arraydeque
title: "Queue·Deque와 ArrayDeque"
summary: "FIFO와 양끝 삽입·삭제 계약에 맞는 큐 API를 선택한다"
level: 1
status: PUBLISHED
displayOrder: 60
references:
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html"
    title: "Deque API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 1
    relationNote: 양끝 큐와 예외/특수값 메서드 쌍 확인
  - url: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html"
    title: "ArrayDeque API (Java SE 25)"
    referenceType: OFFICIAL
    language: en
    displayOrder: 2
    relationNote: resizable-array deque 구현과 null 제한 확인
---
# Queue·Deque와 ArrayDeque

## 쉬운 진입

대기열은 먼저 들어온 사람이 먼저 나가는 FIFO다. `Deque`는 앞과 뒤 양쪽에서 넣고 뺄 수
있어 스택과 큐를 하나의 계약으로 표현한다.

## 정확한 메커니즘

```text
offerLast(A) -> [A] -> offerLast(B) -> [A, B]
pollFirst()  -> A     push(C)        -> [C, B]
```

`add/offer`, `remove/poll`, `element/peek`는 용량 부족·빈 상태에서 예외를 던지는지
특수값을 반환하는지의 차이가 있다. ArrayDeque는 null을 허용하지 않고 양끝 작업에 적합한
resizable array 기반 구현이다.

## 실전·면접 연결

빈 큐가 정상적인 흐름이면 `poll/peek` 계열을 사용해 반환값으로 처리하는 편이 자연스럽다.
단일 스레드 작업 큐나 DFS 스택에는 ArrayDeque가 좋은 기본값이고, blocking 생산자-소비자
요구는 별도 동시성 Queue를 선택한다.

## 흔한 오해

- `Queue`가 반드시 thread-safe인 것은 아니다.
- `Deque`의 모든 메서드는 같은 빈 상태 정책을 갖지 않는다.
- ArrayDeque에 null을 sentinel로 넣을 수 없다.
