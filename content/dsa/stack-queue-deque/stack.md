---
kind: concept
contentKey: dsa.core.stack-queue-deque.stack
topicContentKey: dsa.core.stack-queue-deque
slug: stack
title: "Stack"
summary: "push·pop의 LIFO invariant가 최근 상태를 먼저 꺼내는 문제에 적합한 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Stack

Stack은 `push`로 한쪽 끝인 top에 원소를 추가하고 `pop`으로 top 원소를 제거하는 LIFO(Last In, First Out) 자료구조다. 가장 나중에 들어온 원소가 가장 먼저 나온다.

```text
push A → push B → push C
bottom [A][B][C] top

pop → C
pop → B
```

핵심 invariant는 현재 저장된 원소 중 **가장 최근에 push된 원소가 다음 pop 대상**이라는 것이다. Array로 구현한다면 `size`가 live range를 나타내고 `size - 1`이 top이 될 수 있다. Linked structure라면 head를 top으로 사용해 같은 추상 operation을 구현할 수 있다.

이 LIFO 순서는 최근 선택부터 되돌려야 하는 문제와 잘 맞는다. 괄호 검사는 가장 최근에 열린 괄호가 먼저 닫혀야 하고, iterative DFS는 최근에 발견한 탐색 후보를 먼저 꺼내 깊은 방향으로 진행할 수 있다.

Empty stack에서 pop이나 peek를 수행할 수 없으므로 empty 상태도 operation contract의 일부다. **Stack을 선택하는 기준은 최근 상태를 먼저 처리해야 한다는 문제의 순서와 LIFO invariant가 일치하는지**다.
