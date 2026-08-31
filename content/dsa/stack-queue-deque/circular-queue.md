---
kind: concept
contentKey: dsa.core.stack-queue-deque.circular-queue
topicContentKey: dsa.core.stack-queue-deque
slug: circular-queue
title: "Circular Queue"
summary: "front·rear modulo 연산으로 빈 칸을 재사용하는 조건을 설명한다."
level: 2
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
# Circular Queue

고정 배열의 끝에 도달해도 front 뒤의 빈 칸을 재사용하도록 index를 modulo로 순환시키는 구조다. `front`, `size` 또는 한 칸 비워 두는 규칙 중 하나로 empty와 full을 구분해야 하며, 단순히 `front == rear`만 보면 두 상태를 구별할 수 없다.

wrap-around 시 logical 순서는 물리 배열의 두 구간에 나뉜다. resize가 필요하면 front부터 logical order로 복사해야 하며, producer와 consumer가 동시에 접근한다면 visibility와 atomic update는 별도 동기화 문제다.

### Backend 연결

network buffer와 logging ring에서 overwrite·drop·backpressure 정책을 명시한다. queue가 오래된 데이터를 버린다는 사실을 retry-safe 처리로 오해하지 않는다.
