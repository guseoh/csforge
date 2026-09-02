---
kind: concept
contentKey: dsa.core.stack-queue-deque.monotonic-stack-queue
topicContentKey: dsa.core.stack-queue-deque
slug: monotonic-stack-queue
title: "Monotonic Stack and Queue"
summary: "답 후보만 단조 순서로 유지하고 한 원소가 최대 한 번 push/pop되는 amortized O(n) 원리를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "stack의 LIFO operation과 array/linked implementation trade-off를 확인한다."
    displayOrder: 1
---
# Monotonic Stack and Queue

### 모든 과거 원소를 보관하지 않고 앞으로 답이 될 가능성이 있는 후보만 남긴다

next greater element를 찾는다고 하자. 새 값 x가 들어왔을 때 stack top이 x보다 작다면 그 top은 x를 만난 순간 자신의 next greater가 결정된다. 따라서 pop해 답을 확정할 수 있다.

```text
input: 2, 1, 4

push 2      stack [2]
push 1      stack [2,1]
read 4
  pop 1 → next greater = 4
  pop 2 → next greater = 4
  push 4
```

stack에는 아직 더 큰 값을 만나지 못한 candidate만 남고, 값은 한 방향으로 monotonic하게 유지된다.

### pop 조건은 문제 semantics를 그대로 반영한다

`next greater`라면 보통 새 값이 top보다 클 때 pop하지만 `next greater or equal`이면 비교 연산이 달라진다. 같은 값에서 `>`와 `>=` 중 무엇을 쓰느냐가 duplicate index의 답을 바꾼다.

따라서 monotonic structure를 외워서 복사하기보다:

1. 어떤 값이 더 이상 미래 답 후보가 아닌가?
2. 같은 값은 남겨야 하는가?
3. value만 필요한가, index도 필요한가?

를 먼저 정한다.

### 한 iteration에서 여러 번 pop해도 전체는 O(n)이다

어떤 새 값 하나가 stack 전체를 비워 한 번에 O(n)처럼 보일 수 있다. 하지만 각 input element는 stack에 최대 한 번 push되고, 한 번 pop된 뒤 다시 들어오지 않는다.

```text
total pushes <= n
total pops   <= n
```

그래서 전체 sequence의 stack operation 수는 O(n)이다. 이것은 amortized analysis의 대표적인 예다.

### monotonic queue는 sliding window의 만료 조건까지 관리한다

window maximum에서는 deque에 value와 함께 index를 저장한다. 새 원소가 들어올 때 back에서 더 작은 후보를 제거하고, window left boundary보다 오래된 index는 front에서 제거한다.

```text
back  : 새 값보다 약한 후보 제거
front : window 밖으로 만료된 후보 제거
front : 현재 window maximum
```

두 방향에서 removal reason이 다르기 때문에 deque가 자연스럽다.

### 후보 제거는 '현재는 작다'가 아니라 '앞으로도 답이 될 수 없다'는 증명이다

monotonic algorithm의 핵심은 자료구조 모양이 아니라 dominance reasoning이다. 새 값이 이전 값을 완전히 지배해 앞으로 어떤 query에서도 이전 값이 선택되지 않는다는 사실을 증명할 수 있을 때만 제거한다.

이 증명이 없다면 무작정 작은 값을 pop하는 코드는 특정 input에서는 맞아 보여도 다른 window/거리 조건에서 오답이 된다.
