---
kind: concept
contentKey: dsa.core.sequential.singly-linked-list
topicContentKey: dsa.core.sequential
slug: singly-linked-list
title: "Singly Linked List"
summary: "next 링크로 순회하고 위치를 알고 있을 때 삽입하는 invariant를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 30
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Singly Linked List

각 node가 value와 next pointer를 가지며 head에서 링크를 따라 순회한다. 삽입 위치의 이전 node를 이미 알고 있으면 포인터 두 개를 바꿔 O(1)에 넣을 수 있지만, index로 찾으려면 앞에서부터 O(n)을 걷는다.

삭제는 대상 이전 node의 next를 건너뛰게 하고, head·tail·빈 list 예외를 함께 갱신해야 한다. array처럼 연속 저장되지 않아 cache locality가 낮고 node pointer와 allocation overhead가 생긴다.

### Backend 연결

작은 queue나 intrusive list를 선택할 때 link update invariant와 object allocation 비용을 비교한다. 외부 ID를 node pointer처럼 사용하지 말고 재시작·직렬화 경계를 분리한다.
