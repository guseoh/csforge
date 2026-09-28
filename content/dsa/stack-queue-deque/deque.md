---
kind: concept
contentKey: dsa.core.stack-queue-deque.deque
topicContentKey: dsa.core.stack-queue-deque
slug: deque
title: "덱(Deque)"
summary: "앞·뒤 양끝에서 삽입·삭제하는 연산과 스택·큐 활용을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "스택·큐의 LIFO/FIFO 계약과 배열, 크기 조정 배열, 연결 리스트 구현을 비교한다."
    displayOrder: 1
---
# 덱(Deque)

덱(deque, double-ended queue)은 앞과 뒤 양쪽 끝에서 원소를 삽입하고 삭제할 수 있는 자료구조다.

```text
앞에 추가 ← [A][B][C] → 뒤에 추가
앞에서 제거 ←       → 뒤에서 제거
```

한쪽 끝에서만 넣고 빼면 스택처럼 사용할 수 있고, 뒤에 넣고 앞에서 빼면 큐처럼 사용할 수 있다. 하지만 양끝 연산을 제공한다는 것이 임의의 중간 위치 접근이나 우선순위 정렬까지 제공한다는 뜻은 아니다.

구현에는 **원형 배열(circular array)**이나 **이중 연결 리스트(doubly linked list)**를 사용할 수 있다. 원형 배열은 앞·뒤 인덱스를 배열 끝에서 다시 처음으로 이어지도록 이동시키고, 이중 연결 리스트는 머리와 꼬리 쪽 연결을 갱신한다. 같은 덱이라도 구현 방식에 따라 크기 조정 비용, 메모리 지역성, 추가 메모리 비용이 달라질 수 있다.

덱이 특히 유용한 경우는 양쪽 끝에서 서로 다른 제거 조건을 적용해야 할 때다. 슬라이딩 윈도 알고리즘에서는 범위를 벗어난 오래된 원소를 앞에서 제거하고, 새 원소가 들어오면서 더 이상 최댓값·최솟값 후보가 될 수 없는 원소를 뒤에서 제거할 수 있다.

**덱의 핵심은 양끝을 모두 빠른 삽입·삭제 경계로 사용할 수 있다는 점**이며, 어떤 끝에서 무엇을 넣고 빼는지는 문제의 불변식이 결정한다.
