---
kind: concept
contentKey: dsa.core.sequential.doubly-linked-list
topicContentKey: dsa.core.sequential
slug: doubly-linked-list
title: "Doubly Linked List"
summary: "prev·next를 함께 갱신해 양방향 삭제를 보장하는 과정을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Doubly Linked List

doubly linked list는 각 node에 prev와 next를 둬 현재 node를 알고 있으면 양쪽으로 이동하고 삭제할 수 있다. 삽입 시 predecessor의 next, successor의 prev, 새 node의 양 링크를 모두 갱신해야 하며 sentinel node는 빈 경계 조건을 단순화한다.

추가 pointer와 memory가 singly list보다 들지만 tail에서 역순 순회와 O(1) 삭제가 쉬워진다. link 하나만 갱신하면 list가 끊기거나 cycle이 생기므로 operation 후 head/tail과 양방향 일관성을 검사한다.

### Backend 연결

LRU eviction처럼 양끝 이동과 중간 삭제가 함께 필요한 경우에 유용하다. map과 list를 결합하면 두 구조의 key/node invariant와 rollback 순서를 함께 관리해야 한다.
