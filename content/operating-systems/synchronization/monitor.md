---
kind: concept
contentKey: operating-systems.core.synchronization.monitor
topicContentKey: operating-systems.core.synchronization
slug: monitor
title: "Monitor"
summary: "data·lock·condition protocol을 한 abstraction으로 묶는 이유를 설명한다."
level: 2
status: PUBLISHED
displayOrder: 40
references:
  - url: "https://man7.org/linux/man-pages/man7/pthreads.7.html"
    title: "pthreads(7) — Linux manual page"
    referenceType: OFFICIAL
    language: en
    depth: section
    recommendation: "deadlock과 자원 대기 protocol을 확인한다."
    displayOrder: 1
---
# Monitor

monitor는 shared data와 그 data를 조작하는 method, mutual exclusion과 condition protocol을 한 abstraction으로 묶는다. 호출자는 lock의 내부 순서를 직접 조작하지 않고 monitor가 정의한 invariant를 통해 상태를 바꾼다.

monitor method가 외부 callback이나 blocking I/O를 lock 안에서 수행하면 보호 범위가 지나치게 넓어진다. 상태 snapshot을 만든 뒤 lock 밖에서 느린 작업을 수행하고 결과를 다시 검증하는 방식이 필요할 수 있다.

### Backend 연결

작업 queue abstraction은 enqueue/dequeue와 shutdown 상태를 한 곳에서 보호한다. queue 내부 lock과 처리 대상 외부 resource lock을 섞지 않아 lock cycle을 줄인다.
