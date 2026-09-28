---
kind: concept
contentKey: dsa.core.sequential.doubly-linked-list
topicContentKey: dsa.core.sequential
slug: doubly-linked-list
title: "이중 연결 리스트(Doubly Linked List)"
summary: "prev·next를 함께 유지해 양방향 순회와 known-node 삭제를 지원하는 불변식을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "스택·큐의 LIFO/FIFO 계약과 배열, 크기 조정 배열, linked-list 구현을 비교한다."
    displayOrder: 1
---
# 이중 연결 리스트(Doubly Linked List)

이중 연결 리스트는 각 노드가 다음 노드를 가리키는 `next`와 이전 노드를 가리키는 `prev`를 함께 저장한다. 그래서 현재 노드를 알고 있다면 양쪽 방향으로 바로 이동할 수 있다.

```text
null ← [A] ⇄ [B] ⇄ [C] ⇄ [D] → null
```

특정 노드 C를 이미 알고 있을 때 C를 삭제하려면 양쪽 이웃 B와 D를 직접 연결하면 된다.

```text
B.next = D
D.prev = B
```

이 link update 자체는 `O(1)`이다. 하지만 삭제할 노드를 인덱스나 value로 먼저 찾아야 한다면 검색에 `O(n)`이 필요하므로, 연결 리스트 삭제를 조건 없이 O(1)이라고 표현하면 안 된다.

양방향 link는 더 강한 불변식을 요구한다. 인접한 B와 C에 대해 `B.next == C`라면 동시에 `C.prev == B`도 일관되게 유지되어야 한다. Insert/delete에서 한쪽 link만 갱신하면 forward와 reverse traversal이 서로 다른 구조를 보게 된다.

`prev` reference를 추가한 대가로 노드당 메모리 사용과 link update 수는 증가한다. 따라서 **known 노드의 양방향 이동·삭제가 중요한 경우에는 유리하지만, 단순 순차 저장만 필요하다면 추가 pointer 비용까지 고려해야 한다.**
