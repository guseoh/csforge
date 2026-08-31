---
kind: concept
contentKey: dsa.core.stack-queue-deque.queue
topicContentKey: dsa.core.stack-queue-deque
slug: queue
title: "Queue"
summary: "enqueue·dequeue의 FIFO 상태와 producer-consumer 모델을 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "연속 저장과 pointer chaining의 trade-off를 확인한다."
    displayOrder: 1
---
# Queue

queue는 먼저 들어온 원소를 먼저 꺼내는 FIFO 구조다. enqueue는 rear에 추가하고 dequeue는 front에서 제거하므로 두 pointer의 의미와 empty/full 조건을 유지해야 한다. producer-consumer에서는 queue가 작업의 순서와 burst를 흡수하는 경계가 된다.

무한 queue는 producer가 빠를 때 memory를 계속 먹고, bounded queue는 가득 찬 순간 block·drop·backpressure 중 하나를 선택해야 한다. 순서 보장은 중복 실행이나 작업 성공까지 보장하지 않는다.

### Backend 연결

worker queue의 depth, enqueue latency, rejection policy를 SLA에 포함한다. OS blocking queue나 message broker를 선택할 때 FIFO 범위와 durable 여부를 별도로 기록한다.
