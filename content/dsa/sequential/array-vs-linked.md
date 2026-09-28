---
kind: concept
contentKey: dsa.core.sequential.array-vs-linked
topicContentKey: dsa.core.sequential
slug: array-vs-linked
title: "배열과 연결 리스트 비교"
summary: "접근·삽입 위치 탐색·메모리 지역성과 per-node 비용으로 배열과 linked structure를 비교한다."
level: 2
status: PUBLISHED
displayOrder: 50
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "스택·큐의 LIFO/FIFO 계약과 배열, 크기 조정 배열, linked-list 구현을 비교한다."
    displayOrder: 1
---
# 배열과 연결 리스트 비교

배열과 linked structure는 모두 순서 있는 원소를 저장할 수 있지만, 원소 위치를 표현하는 방식이 다르기 때문에 연산 비용도 달라진다.

배열은 인덱스로 위치를 직접 계산할 수 있어 임의 접근이 `O(1)`이고 연속 저장 덕분에 sequential scan의 지역성이 좋다. 대신 중간에 순서를 유지하며 삽입·삭제하려면 뒤 원소를 이동해야 하므로 `O(n)` 비용이 들 수 있다.

연결 리스트는 노드를 link로 연결하므로 인덱스 access는 일반적으로 `O(n)`이다. 반면 삽입·삭제할 노드 또는 그 이웃을 이미 알고 있다면 몇 개의 link만 변경해 `O(1)`에 구조를 바꿀 수 있다.

```text
                 Array        Linked list
index access     O(1)         O(n)
sequential scan  O(n)         O(n)
known-position
link change      shift O(n)    O(1)
```

여기서 표의 `O(n)` scan이 실제 실행 시간까지 같다는 뜻은 아니다. 배열은 연속 메모리 덕분에 캐시 지역성이 좋은 반면 linked structure는 pointer chasing과 per-node 메모리 할당 비용이 생길 수 있다.

따라서 자료구조 선택은 이름이나 Big-O 표 한 칸으로 결정하지 않는다. **조회·순회·삽입·삭제 중 어떤 연산이 자주 일어나고, 연산 위치를 이미 알고 있는지, 지역성과 메모리 overhead가 얼마나 중요한지**를 함께 봐야 한다.
