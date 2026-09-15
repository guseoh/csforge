---
kind: concept
contentKey: dsa.core.stack-queue-deque.monotonic-stack-queue
topicContentKey: dsa.core.stack-queue-deque
slug: monotonic-stack-queue
title: "Monotonic Stack and Queue"
summary: "답 후보만 단조 순서로 유지하며 각 원소가 최대 한 번 push·pop되어 전체 O(n)이 되는 원리를 설명한다."
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

Monotonic stack이나 queue는 모든 이전 원소를 그대로 저장하지 않고 **앞으로 답이 될 가능성이 남은 후보만 단조 순서로 유지하는 구조**다.

예를 들어 next greater element 문제에서 새 값 `4`를 읽었을 때 stack top이 `1`, 그 아래가 `2`라면 둘 다 4를 만나는 순간 다음 큰 값이 결정된다.

```text
input: 2, 1, 4
stack: [2, 1]
read 4
  pop 1
  pop 2
  push 4
```

어떤 값을 제거할 수 있는지는 문제 semantics가 결정한다. `greater`인지 `greater or equal`인지에 따라 같은 값 처리도 달라지므로 단순히 `>`나 `>=` 패턴을 외우는 것이 아니라 **새 원소가 기존 후보를 앞으로도 쓸모없게 만드는지**를 판단해야 한다.

한 새 원소를 처리할 때 여러 번 pop할 수 있어도 전체 비용은 `O(n)`이다. 각 입력 원소는 구조에 최대 한 번 push되고 한 번 pop되기 때문이다.

```text
total push <= n
total pop  <= n
```

Sliding-window maximum에서는 deque에 index를 저장해 front에서는 window 밖으로 나간 후보를 제거하고, back에서는 새 값보다 약해 앞으로 maximum이 될 수 없는 후보를 제거한다. **Monotonic 구조의 핵심은 dominance를 증명해 필요 없는 후보를 일찍 제거하고, 그 제거 횟수를 전체 sequence에서 제한하는 것**이다.
