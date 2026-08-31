---
kind: concept
contentKey: dsa.core.stack-queue-deque.deque
topicContentKey: dsa.core.stack-queue-deque
slug: deque
title: "Deque"
summary: "양 끝 삽입·삭제를 지원하는 invariant와 사용 사례를 비교한다."
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
# Deque

deque는 앞과 뒤에서 삽입·삭제할 수 있어 stack과 queue를 모두 표현한다. 각 끝의 pointer와 size가 유효한 범위를 유지해야 하며, 중간 index 접근까지 빠르다는 의미는 아니다. 배열 ring과 doubly linked list가 대표 구현이다.

양끝 작업만 필요할 때는 단순하지만, random lookup이 많으면 array가 더 낫고 node 이동이 잦으면 linked locality 비용이 커진다. deque를 priority queue처럼 사용하면 우선순위 invariant가 보장되지 않는다.

### Backend 연결

sliding window와 work-stealing queue에서 어느 끝을 누가 소유하는지 명시한다. concurrent deque는 자료구조 invariant와 memory ordering을 함께 검증한다.
