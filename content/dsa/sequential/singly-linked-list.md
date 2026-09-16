---
kind: concept
contentKey: dsa.core.sequential.singly-linked-list
topicContentKey: dsa.core.sequential
slug: singly-linked-list
title: "Singly Linked List"
summary: "next link로 순회하고 위치를 알고 있을 때 삽입·삭제하는 invariant와 탐색 비용을 설명한다."
level: 1
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
# Singly Linked List

Singly linked list의 각 node는 value와 다음 node를 가리키는 `next` link를 가진다. 첫 node인 `head`에서 시작해 link를 따라가야 하므로 특정 index의 node에 접근하려면 앞 node들을 차례로 방문해야 한다.

```text
head
 ↓
[A] → [B] → [C] → [D] → null
```

따라서 일반적인 index access는 `O(n)`이다. Array처럼 index로 위치를 직접 계산할 수 없는 대신 node들은 memory에서 연속해 있을 필요가 없다.

Linked list의 삽입을 `O(1)`이라고 말할 때는 **삽입 위치의 node를 이미 알고 있다**는 전제가 중요하다. B 뒤에 X를 넣는다면 다음 link만 바꾸면 된다.

```text
X.next = B.next
B.next = X
```

반대로 `10번째 위치에 삽입`처럼 먼저 위치를 찾아야 한다면 탐색에 `O(n)`이 필요하다.

삭제도 같은 원리다. Singly linked list에서 node C를 제거하려면 predecessor B의 `next`를 C 다음 node로 바꿔야 한다. C만 알고 predecessor를 모르면 head부터 순회해 이전 node를 찾아야 할 수 있다.

정상 list는 head에서 `next`를 반복했을 때 의도한 node들이 하나의 sequence로 이어지고 마지막에 `null`에 도달하는 invariant를 가진다. **Linked list의 비용은 link 변경 자체뿐 아니라 operation 위치를 어떻게 찾는지까지 포함해서 분석해야 한다.**
