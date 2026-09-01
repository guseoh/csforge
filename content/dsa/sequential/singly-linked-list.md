---
kind: concept
contentKey: dsa.core.sequential.singly-linked-list
topicContentKey: dsa.core.sequential
slug: singly-linked-list
title: "Singly Linked List"
summary: "next link를 따라가는 순차 접근과 insert/delete 시 link invariant·search cost를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "linked-node representation과 stack/queue 구현에서 link가 갱신되는 방식을 확인한다."
    displayOrder: 1
---
# Singly Linked List

### 원소 위치를 계산하는 대신 다음 node를 따라간다

Singly linked list의 각 node는 자신의 value와 다음 node를 가리키는 `next` link를 가진다. List 전체의 시작점인 `head`만 알고 있다면 index 5의 원소에 가기 위해서는 head에서 next를 다섯 번 따라가야 한다.

```text
head
 ↓
[A] → [B] → [C] → [D] → null
```

Array처럼 `base + index × size`로 위치를 바로 계산할 수 없으므로 일반적인 index lookup은 O(n)이다. 반면 node들이 memory에서 연속일 필요가 없어 각 node를 독립적으로 연결할 수 있다.

### '삽입 O(1)'에는 위치를 이미 알고 있다는 전제가 있다

Node B 뒤에 X를 삽입한다고 하자. B의 reference를 이미 가지고 있다면 link 두 개만 바꾸면 된다.

```text
before: B → C

X.next = B.next
B.next = X

after : B → X → C
```

이 link update 자체는 O(1)이다. 하지만 'index 10 뒤에 넣어라'라는 요청처럼 B를 먼저 찾아야 한다면 head에서 순회하는 O(n) 비용이 추가된다.

따라서 linked list의 삽입을 무조건 O(1)이라고 외우면 안 된다. **Insertion point를 찾는 비용과 실제 link를 바꾸는 비용을 분리**해야 한다.

### 삭제는 predecessor가 필요한 이유가 있다

Singly linked list는 현재 node에서 이전 node로 바로 갈 수 없다. Node C를 삭제하려면 C의 predecessor B가 필요하다.

```text
before: B → C → D
B.next = C.next
after : B ─────→ D
```

C만 알고 있고 predecessor를 모른다면 head부터 C를 찾으면서 이전 node를 함께 추적해야 할 수 있다. Head 자체를 삭제하는 경우에는 `head = head.next`라는 별도 경계 처리가 필요하다.

Tail pointer를 따로 유지하는 구현이라면 마지막 node 삭제/추가 때 tail invariant도 함께 갱신해야 한다.

### Linked structure의 correctness는 reachability invariant로 볼 수 있다

정상 singly linked list에서는 head에서 next를 반복했을 때 의도한 node들이 정확히 한 sequence로 이어지고 마지막은 null에 도달해야 한다. 잘못된 link update는 일부 node를 잃거나 cycle을 만들 수 있다.

```text
A → B → C → D

실수로 B.next = D
→ C는 head에서 더 이상 도달할 수 없음
```

Operation 직후 단순히 size 숫자만 맞는지 보지 않고 실제 reachability와 head/tail을 함께 확인해야 하는 이유다.

### Memory locality와 allocation cost도 array와 다르다

각 node를 별도 allocation하면 value 외에 next reference가 추가되고 allocator/object header 비용도 생길 수 있다. Node가 heap 여러 위치에 흩어지면 traversal에서 pointer chasing과 cache miss가 늘 수 있다.

그래서 sequential scan이 중심인 workload에서는 O(n) traversal이라는 점이 같더라도 contiguous array가 더 빠를 수 있다. 반대로 이미 node reference를 가지고 있고 중간 link 변경이 매우 잦으며 stable node identity가 필요한 구조에서는 linked representation이 유리할 수 있다.

Queue, adjacency list, intrusive data structure 등을 설계할 때는 'LinkedList라는 이름'이 아니라 **lookup, insertion point 획득, traversal, allocation, locality의 실제 operation sequence**를 기준으로 선택한다.
