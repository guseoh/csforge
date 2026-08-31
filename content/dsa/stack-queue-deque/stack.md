---
kind: concept
contentKey: dsa.core.stack-queue-deque.stack
topicContentKey: dsa.core.stack-queue-deque
slug: stack
title: "Stack"
summary: "push·pop의 LIFO invariant와 사용 이유를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 10
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Stack

stack은 마지막에 들어온 원소를 먼저 꺼내는 LIFO 구조다. push는 top을 늘리고 pop은 top을 줄이며, empty 상태에서 pop하지 않는 invariant가 연산의 전제다. 함수 호출, 괄호 검사, DFS처럼 최근 선택을 되돌리는 문제에 자연스럽다.

배열 기반 stack은 locality가 좋고 linked stack은 capacity 확장이 단순하지만 node allocation이 든다. pop한 원소가 더 이상 보이지 않는다는 뜻과 memory가 즉시 반환된다는 뜻은 다르다.

### Backend 연결

parser와 undo history에서 stack depth 제한과 overflow를 명시한다. 재귀 호출 stack과 application stack 자료구조를 같은 resource로 가정하지 않는다.
