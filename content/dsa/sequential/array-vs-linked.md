---
kind: concept
contentKey: dsa.core.sequential.array-vs-linked
topicContentKey: dsa.core.sequential
slug: array-vs-linked
title: "Array versus Linked"
summary: "접근·삽입 위치 탐색·memory locality와 per-node 비용으로 array와 linked structure를 비교한다."
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
# Array versus Linked

Array와 linked structure는 모두 순서 있는 원소를 저장할 수 있지만, 원소 위치를 표현하는 방식이 다르기 때문에 operation 비용도 달라진다.

Array는 index로 위치를 직접 계산할 수 있어 random access가 `O(1)`이고 연속 저장 덕분에 sequential scan의 locality가 좋다. 대신 중간에 순서를 유지하며 삽입·삭제하려면 뒤 원소를 이동해야 하므로 `O(n)` 비용이 들 수 있다.

Linked list는 node를 link로 연결하므로 index access는 일반적으로 `O(n)`이다. 반면 삽입·삭제할 node 또는 그 이웃을 이미 알고 있다면 몇 개의 link만 변경해 `O(1)`에 구조를 바꿀 수 있다.

```text
                 Array        Linked list
index access     O(1)         O(n)
sequential scan  O(n)         O(n)
known-position
link change      shift O(n)    O(1)
```

여기서 표의 `O(n)` scan이 실제 실행 시간까지 같다는 뜻은 아니다. Array는 연속 memory 덕분에 cache locality가 좋은 반면 linked structure는 pointer chasing과 per-node allocation 비용이 생길 수 있다.

따라서 자료구조 선택은 이름이나 Big-O 표 한 칸으로 결정하지 않는다. **조회·순회·삽입·삭제 중 어떤 operation이 자주 일어나고, operation 위치를 이미 알고 있는지, locality와 memory overhead가 얼마나 중요한지**를 함께 봐야 한다.
