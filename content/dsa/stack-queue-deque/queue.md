---
kind: concept
contentKey: dsa.core.stack-queue-deque.queue
topicContentKey: dsa.core.stack-queue-deque
slug: queue
title: "Queue"
summary: "FIFO ordering과 front/rear state가 producer-consumer 흐름을 만드는 원리와 bounded queue trade-off를 설명한다."
level: 1
status: PUBLISHED
displayOrder: 20
references:
  - url: "https://algs4.cs.princeton.edu/13stacks/"
    title: "Algorithms, 4th Edition: Stacks and Queues"
    referenceType: BOOK
    language: en
    depth: section
    recommendation: "queue의 FIFO operation과 array/linked representation을 확인한다."
    displayOrder: 1
---
# Queue

### 먼저 들어온 원소가 먼저 나간다

queue는 rear에 원소를 추가하고 front에서 원소를 제거하는 FIFO 구조다.

```text
enqueue A
enqueue B
enqueue C

front [A, B, C] rear

dequeue → A
dequeue → B
```

이 ordering은 먼저 접수된 작업을 먼저 처리해야 하는 buffer나 BFS처럼 발견 순서를 유지하는 탐색에 자연스럽다.

### front와 rear는 live range를 표현한다

array implementation에서는 front와 rear index가 logical queue의 시작과 끝을 나타낸다. 단순하게 dequeue마다 뒤 원소를 전부 왼쪽으로 이동하면 O(n)이 되므로, 일반적으로 front를 이동시키거나 circular buffer를 사용해 이미 비워진 공간을 재사용한다.

linked queue라면 head(front)와 tail(rear)을 유지해 enqueue/dequeue를 O(1)에 만들 수 있다. tail을 갱신하지 않거나 마지막 원소 제거 뒤 head/tail 상태를 함께 정리하지 않으면 empty invariant가 깨질 수 있다.

### FIFO는 성공 순서를 보장하지 않는다

queue가 FIFO라는 것은 dequeue 대상으로 선택되는 순서를 말한다. worker가 여러 개라면 먼저 dequeue된 task가 실제로 먼저 완료된다는 보장은 없고, 실패한 작업이 retry되면 처리 완료 순서는 더 달라질 수 있다.

따라서 자료구조의 FIFO ordering과 application의 completion ordering, exactly-once 같은 delivery semantics를 섞지 않는다.

### bounded queue는 overload를 외부로 드러낸다

producer가 초당 1000개를 넣는데 consumer가 600개만 처리한다면 unbounded queue의 depth는 계속 증가한다. queue가 문제를 해결한 것이 아니라 memory 안에 backlog를 숨긴 것이다.

bounded queue는 capacity에 도달했을 때 다음 중 하나를 선택해야 한다.

- producer block
- enqueue reject
- 기존/새 item drop
- upstream에 backpressure 전달

이 선택은 queue 자료구조 위의 workload policy지만, capacity가 유한하다는 사실은 memory와 latency upper bound를 관리하는 데 중요하다.

### queue depth는 waiting time과 연결된다

처리율이 같아도 depth가 늘면 새 task가 실제 실행되기까지 기다리는 시간이 길어진다. backend worker에서 throughput만 보고 queue wait를 무시하면 처리 자체는 빠른데 end-to-end latency가 커지는 현상을 놓칠 수 있다.
